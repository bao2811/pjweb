import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Không có tệp được cung cấp" }, { status: 400 })
    }

    // Kiểm tra loại tệp
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Tệp phải là hình ảnh" }, { status: 400 })
    }

    // Kiểm tra kích thước (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Hình ảnh không được vượt quá 5MB" }, { status: 500 })
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload thất bại" }, { status: 500 })
  }
}
