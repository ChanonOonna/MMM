import { prisma } from "../../lib/prisma";
import { notify } from "../../lib/notify";

export class ReportError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const NO_SHOW_WARNING_THRESHOLD = 5;

// RPT-01, RPT-02, RPT-03: no_show reports require evidence
export async function fileReport(reporterId: string, input: {
  reportedUserId: string;
  category: string;
  description?: string;
  evidenceUrl?: string;
  contextType: string;
  contextId: string;
}) {
  if (input.category === "no_show" && !input.evidenceUrl) {
    throw new ReportError(400, "Report No Show ต้องแนบหลักฐาน");
  }
  if (input.reportedUserId === reporterId) {
    throw new ReportError(400, "ไม่สามารถ Report ตัวเองได้");
  }

  return prisma.report.create({
    data: {
      reporterId,
      reportedUserId: input.reportedUserId,
      category: input.category as any,
      description: input.description,
      evidenceUrl: input.evidenceUrl,
      contextType: input.contextType as any,
      contextId: input.contextId,
    },
  });
}

// ADM-03: report queue for admin review
const reportUserSelect = { id: true, firstName: true, lastName: true, nickname: true } as const;

export async function listReportQueue(status?: string) {
  return prisma.report.findMany({
    where: status ? { status: status as any } : { status: "pending" },
    include: { reporter: { select: reportUserSelect }, reportedUser: { select: reportUserSelect } },
    orderBy: { createdAt: "asc" },
  });
}

// RPT-06, RPT-07, RPT-08, NTF-11, NTF-12, RPT-05
export async function approveReport(reportId: string, adminNote?: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new ReportError(404, "ไม่พบ Report");
  if (report.status !== "pending") throw new ReportError(400, "Report นี้ถูกตัดสินไปแล้ว");

  return prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id: reportId },
      data: { status: "approved", adminNote, resolvedAt: new Date() },
    });

    if (report.category === "no_show") {
      const user = await tx.user.update({
        where: { id: report.reportedUserId },
        data: { noShowCount: { increment: 1 } },
      });

      if (user.noShowCount >= NO_SHOW_WARNING_THRESHOLD && !user.warningBadge) {
        await tx.user.update({ where: { id: user.id }, data: { warningBadge: true } });
        await notify(user.id, "no_show_warning", { noShowCount: user.noShowCount });
      }
    }

    await notify(report.reportedUserId, "report_resolved", { reportId, outcome: "approved" });
    await notify(report.reporterId, "report_resolved", { reportId, outcome: "approved" });
  });
}

export async function rejectReport(reportId: string, adminNote?: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new ReportError(404, "ไม่พบ Report");
  if (report.status !== "pending") throw new ReportError(400, "Report นี้ถูกตัดสินไปแล้ว");

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "rejected", adminNote, resolvedAt: new Date() },
  });

  await notify(report.reporterId, "report_resolved", { reportId, outcome: "rejected" });
}

// ADM-08: admin can reset a user's no-show count
export async function resetNoShowCount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { noShowCount: 0, warningBadge: false },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      nickname: true,
      role: true,
      warningBadge: true,
      noShowCount: true,
      createdAt: true,
    },
  });
}
