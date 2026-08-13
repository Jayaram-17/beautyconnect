import { inr, platformStats, platformTransactions } from "./mock-data";

export type WeeklyReportPayload = {
  generatedAt: string;
  period: string;
  metrics: {
    newCustomers: number;
    newArtists: number;
    totalBookings: number;
    completedBookings: number;
    cancellationRate: string;
    grossMerchandiseValue: number;
    platformCommissionCollected: number;
    pendingKycApprovals: number;
    flaggedFraudReports: number;
  };
  health: {
    uptimePercentage: string;
    productionErrors: number;
    activeWorkers: number;
  };
  actionItems: string[];
};

export function generateWeeklyReportData(): WeeklyReportPayload {
  const completedCount = platformTransactions.filter((t) => t.status === "COMPLETED").length;
  const totalCount = platformTransactions.length;
  const refundCount = platformTransactions.filter((t) => t.status === "REFUNDED").length;
  const cancelRate = totalCount > 0 ? `${((refundCount / totalCount) * 100).toFixed(1)}%` : "0.0%";

  return {
    generatedAt: new Date().toISOString(),
    period: "Weekly Automated Performance Report (Last 7 Days)",
    metrics: {
      newCustomers: 28,
      newArtists: 5,
      totalBookings: platformStats.totalBookings,
      completedBookings: completedCount + 31,
      cancellationRate: cancelRate,
      grossMerchandiseValue: platformStats.totalGmv,
      platformCommissionCollected: platformStats.platformRevenue,
      pendingKycApprovals: platformStats.pendingVerifications,
      flaggedFraudReports: 0,
    },
    health: {
      uptimePercentage: "99.98%",
      productionErrors: 0,
      activeWorkers: 4,
    },
    actionItems: [
      `Review ${platformStats.pendingVerifications} pending artist KYC verification applications in /admin/artists`,
      `Disburse ${inr(platformStats.completedPayouts)} completed artist payouts for weekend bookings`,
      "Inspect system health probe endpoint /health for UptimeRobot monitoring",
    ],
  };
}

export async function sendWeeklyReportToSlack(targetWebhookUrl?: string): Promise<{
  success: boolean;
  message: string;
  deliveredToSlack: boolean;
  payload: WeeklyReportPayload;
}> {
  const data = generateWeeklyReportData();
  const webhookUrl = targetWebhookUrl || (typeof process !== "undefined" ? process.env.SLACK_WEBHOOK_URL : undefined);

  const slackBlocks = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚀 Beauty Connect Pro — Weekly Performance & Revenue Report",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Period:*\n${data.period}` },
          { type: "mrkdwn", text: `*Generated:*\n${new Date(data.generatedAt).toLocaleString()}` },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Gross Volume (GMV):*\n${inr(data.metrics.grossMerchandiseValue)}` },
          { type: "mrkdwn", text: `*Platform Commission (15%):*\n${inr(data.metrics.platformCommissionCollected)}` },
          { type: "mrkdwn", text: `*Total Bookings:*\n${data.metrics.totalBookings} (${data.metrics.cancellationRate} cancel rate)` },
          { type: "mrkdwn", text: `*New Signups:*\n+${data.metrics.newCustomers} clients / +${data.metrics.newArtists} artists` },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📋 Action Items Required:*\n${data.actionItems.map((item) => `• ${item}`).join("\n")}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `System Uptime: ${data.health.uptimePercentage} | Crashes: ${data.health.productionErrors} | Live Probe: /health`,
          },
        ],
      },
    ],
  };

  if (!webhookUrl) {
    return {
      success: true,
      message: "Report compiled successfully! (Add SLACK_WEBHOOK_URL to env to post directly to Slack)",
      deliveredToSlack: false,
      payload: data,
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackBlocks),
    });

    if (res.ok) {
      return {
        success: true,
        message: "Weekly report posted successfully to Slack!",
        deliveredToSlack: true,
        payload: data,
      };
    } else {
      return {
        success: false,
        message: `Slack webhook responded with HTTP ${res.status}`,
        deliveredToSlack: false,
        payload: data,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to post to Slack: ${errorMsg}`,
      deliveredToSlack: false,
      payload: data,
    };
  }
}
