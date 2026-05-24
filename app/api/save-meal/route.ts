import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId, date, mealData } = await req.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "Supabase環境変数が未設定です" }, { status: 500 });
    }

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("meal_logs")
      .insert({ user_id: userId, date, ...mealData })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 削除用
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "Supabase環境変数が未設定です" }, { status: 500 });
    }

    const supabase = createClient(url, key);

    // .select() を付けることで「実際に削除された行数」を確認できる
    const { data: deleted, error } = await supabase
      .from("meal_logs")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 0件削除（RLSブロックなど）の場合もエラーを返す
    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: "削除できませんでした。Supabaseのポリシー設定を確認してください。" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
