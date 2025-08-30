import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// import bcrypt from "bcryptjs"; // install this

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // 1. Check if user exists
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (findError && findError.code !== "PGRST116") {
      return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
    }

    // 2. If user exists, validate password
    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
    } else {
      // 3. Create new user with hashed password
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ username, password: hashedPassword }])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: "Error creating user" }, { status: 500 });
      }

      return NextResponse.json({
        id: newUser.id,
        username: newUser.username,
        token: `fake-token-${newUser.id}`
      });
    }

    // 4. Login success → return token
    return NextResponse.json({
      id: user.id,
      username: user.username,
      token: `fake-token-${user.id}`
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
