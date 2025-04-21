import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, CreditCard, RefreshCw } from "lucide-react";
import Link from "next/link";
import { VideoList } from "@/components/VideoList";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // 获取用户信息和视频列表
  const [user, videos] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    }),
    prisma.video.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        title: true,
        description: true,
        url: true,
        thumbnail: true,
        images: true
      }
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            欢迎回来，{session.user?.name}
          </h1>
          <p className="text-gray-600">管理您的视频和积分</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Button asChild>
            <Link href="/create">
              <Video className="w-4 h-4 mr-2" />
              创建新视频
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">
              <CreditCard className="w-4 h-4 mr-2" />
              购买积分
            </Link>
          </Button>
        </div>
      </div>

      {/* 积分信息 */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">我的积分</h2>
            <p className="text-3xl font-bold text-primary">
              {user?.credits || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">剩余可用积分</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/pricing">
              <RefreshCw className="w-4 h-4 mr-2" />
              充值积分
            </Link>
          </Button>
        </div>
      </Card>

      {/* 视频列表 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">我的视频</h2>
        <VideoList videos={videos} />
      </div>
    </div>
  );
}
