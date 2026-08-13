"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Bot,
  User,
  Calendar,
  Clock,
  MapPin,
  Boxes,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_AI_CALLS } from "@/lib/mock-data";
import { formatRelativeTime, formatDuration, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const call = MOCK_AI_CALLS.find((c) => c.id === id);
  if (!call) notFound();

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(23);

  const hasTranscript = call.transcript.length > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/ai-calls">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Call with {call.vendorName}</h1>
            <StatusBadge status={call.status} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {call.agentName} · {formatRelativeTime(call.startedAt)}
            {call.duration > 0 && ` · ${formatDuration(call.duration)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(call.status === "failed" || call.status === "no_answer") && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl h-8 gap-1.5"
              onClick={() => toast.success("Retrying call...")}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl h-8 gap-1.5"
            onClick={() => toast.success("Exporting transcript...")}
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left – transcript + audio */}
        <div className="lg:col-span-2 space-y-4">
          {/* Audio player */}
          {hasTranscript && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Audio Playback</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast("Seeking to start...")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toast("Seeking to end...")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  {/* Progress bar */}
                  <div className="flex-1 relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono min-w-max">
                    {Math.floor((call.duration * progress) / 100 / 60)}:{String(Math.floor(((call.duration * progress) / 100) % 60)).padStart(2, "0")} / {formatDuration(call.duration)}
                  </span>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transcript */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Conversation Transcript</h3>
            </div>

            {!hasTranscript ? (
              <div className="py-12 text-center text-sm text-gray-400">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                No transcript available for this call.
              </div>
            ) : (
              <div className="space-y-4">
                {call.transcript.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    className={`flex gap-3 ${msg.role === "agent" ? "" : "flex-row-reverse"}`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === "agent"
                        ? "bg-indigo-50 dark:bg-indigo-950"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      {msg.role === "agent"
                        ? <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        : <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      }
                    </div>
                    <div className={`max-w-[75%] ${msg.role === "agent" ? "" : "items-end"}`}>
                      <div className={`flex items-baseline gap-2 mb-1 ${msg.role === "vendor" ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {msg.role === "agent" ? call.agentName : call.vendorName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {Math.floor(msg.timestamp / 60)}:{String(msg.timestamp % 60).padStart(2, "0")}
                        </span>
                      </div>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "agent"
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 rounded-tl-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tr-sm"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right – summary + extracted info */}
        <div className="space-y-4">
          {/* AI Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Summary</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{call.summary}</p>

            {call.aiConfidence > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Confidence Score</span>
                  <span className={`font-bold ${call.aiConfidence >= 90 ? "text-emerald-600" : call.aiConfidence >= 75 ? "text-amber-600" : "text-red-600"}`}>
                    {call.aiConfidence}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${call.aiConfidence >= 90 ? "bg-emerald-500" : call.aiConfidence >= 75 ? "bg-amber-400" : "bg-red-500"}`}
                    style={{ width: `${call.aiConfidence}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Extracted Info */}
          {call.extractedInfo.confidence > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Extracted Information</h3>
              <div className="space-y-3">
                {call.extractedInfo.deliveryDate && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Delivery Date
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(call.extractedInfo.deliveryDate)}
                    </p>
                  </div>
                )}
                {call.extractedInfo.delayReason && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      Delay Reason
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400">{call.extractedInfo.delayReason}</p>
                  </div>
                )}
                {call.extractedInfo.confirmedQuantity !== undefined && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <Boxes className="w-3.5 h-3.5" />
                      Confirmed Quantity
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {call.extractedInfo.confirmedQuantity} units
                    </p>
                  </div>
                )}
                {call.extractedInfo.contactName && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <User className="w-3.5 h-3.5" />
                      Contact Confirmed
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">{call.extractedInfo.contactName}</p>
                  </div>
                )}
                {call.extractedInfo.additionalNotes && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Notes
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{call.extractedInfo.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Actions</h3>
            <Button
              className="w-full rounded-xl h-9 bg-indigo-600 hover:bg-indigo-700 text-white justify-start gap-2 text-sm"
              onClick={() => toast.success("Updating ERP...")}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync to ERP
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl h-9 justify-start gap-2 text-sm"
              onClick={() => toast.success("Scheduling follow-up...")}
            >
              <Clock className="w-3.5 h-3.5" />
              Schedule Follow-up
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl h-9 justify-start gap-2 text-sm"
              onClick={() => toast("Escalating to manager...")}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Escalate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
