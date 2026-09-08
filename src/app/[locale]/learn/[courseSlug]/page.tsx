import { LearnerPlayer } from "@/modules/notebook/components/learner-player";
import { AuthGuard } from "@/modules/auth/components/auth-guard";
export default async function Page({ params }: { params: Promise<{ courseSlug: string }> }) { const { courseSlug } = await params; return <AuthGuard><LearnerPlayer slug={courseSlug} /></AuthGuard>; }
