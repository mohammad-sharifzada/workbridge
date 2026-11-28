import { demo_cv_photo } from "@/project_workbridge_main";

export function GET() {
  return new Response(null, { status: 307, headers: { Location: demo_cv_photo } });
}
