"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  TrendingUp,
  Clock,
  Coins,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TokenStatsProps {
  stats: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    tokensUsedToday: number;
    dailyLimit: number;
    averageResponseTime: number;
    totalConversations: number;
    estimatedCost: number;
  };
  isCollapsed?: boolean;
}

export function TokenStats({ stats, isCollapsed = false }: TokenStatsProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    usage: true,
    breakdown: true,
    metrics: false,
  });

  const usagePercentage = (stats.tokensUsedToday / stats.dailyLimit) * 100;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-4">
        <div className="flex flex-col items-center gap-1">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-xs text-muted-foreground">
            {Math.round(usagePercentage)}%
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {stats.totalTokens.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Token Usage</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Current session statistics
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Daily Usage Card */}
        <Card className="bg-secondary/50 border-border p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("usage")}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Daily Usage
              </span>
            </div>
            {expandedSections.usage ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {expandedSections.usage && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {stats.tokensUsedToday.toLocaleString()} /{" "}
                  {stats.dailyLimit.toLocaleString()}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    usagePercentage > 80 ? "text-destructive" : "text-primary"
                  )}
                >
                  {usagePercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {(stats.dailyLimit - stats.tokensUsedToday).toLocaleString()}{" "}
                tokens remaining
              </p>
            </div>
          )}
        </Card>

        {/* Token Breakdown */}
        <Card className="bg-secondary/50 border-border p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("breakdown")}
          >
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-chart-2" />
              <span className="text-sm font-medium text-foreground">
                This Conversation
              </span>
            </div>
            {expandedSections.breakdown ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {expandedSections.breakdown && (
            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-1" />
                  <span className="text-sm text-muted-foreground">
                    Prompt Tokens
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {stats.promptTokens.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-2" />
                  <span className="text-sm text-muted-foreground">
                    Completion Tokens
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {stats.completionTokens.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Total
                </span>
                <span className="text-sm font-bold text-primary">
                  {stats.totalTokens.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-secondary/50 border-border p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("metrics")}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-medium text-foreground">
                Performance
              </span>
            </div>
            {expandedSections.metrics ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {expandedSections.metrics && (
            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Avg Response
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {stats.averageResponseTime}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Conversations
                </span>
                <span className="text-sm font-medium text-foreground">
                  {stats.totalConversations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Est. Cost
                </span>
                <span className="text-sm font-medium text-chart-5">
                  ${stats.estimatedCost.toFixed(4)}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-secondary/50 border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {(stats.totalTokens / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-muted-foreground">Session Tokens</p>
          </Card>
          <Card className="bg-secondary/50 border-border p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.averageResponseTime}
            </p>
            <p className="text-xs text-muted-foreground">Avg ms</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
