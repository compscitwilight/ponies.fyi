import { redirect } from "next/navigation";

export default function NotFound() {
    redirect("/?state=page_not_found");
}