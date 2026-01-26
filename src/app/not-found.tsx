import { redirect } from "next/navigation";

export default function NotFound() {
    return redirect("/?state=page_not_found");
}