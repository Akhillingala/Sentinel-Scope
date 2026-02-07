"use client";

import { useRef, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Loader2, FileText } from "lucide-react";

function MarkdownBlock({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none dark:prose-invert">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("### "))
          return (
            <h3 key={i} className="mt-4 text-base font-semibold">
              {line.slice(4)}
            </h3>
          );
        if (line.startsWith("## "))
          return (
            <h2 key={i} className="mt-4 text-lg font-semibold">
              {line.slice(3)}
            </h2>
          );
        if (line.startsWith("# "))
          return (
            <h1 key={i} className="mt-2 text-xl font-bold">
              {line.slice(2)}
            </h1>
          );
        if (line.startsWith("- ") || line.startsWith("* "))
          return (
            <li key={i} className="ml-4 list-disc">
              {line.slice(2)}
            </li>
          );
        if (line.trim() === "") return <br key={i} />;
        return (
          <p key={i} className="my-1">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function MemosPage() {
  const {
    completion,
    input,
    setInput,
    handleSubmit,
    isLoading,
  } = useCompletion({
    api: "/api/memo",
    streamProtocol: "text",
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [completion]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">AI Memos</h1>
        <p className="mt-1 text-muted-foreground">
          Generate analyst memos with streaming AI. Ask about regions, risk, or scenarios.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              New memo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Risk assessment for Sahel region next quarter"
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            <div className="min-h-[200px] rounded-lg border border-border/50 bg-muted/20 p-4">
              {!completion && !isLoading && (
                <p className="text-center text-sm text-muted-foreground">
                  Send a prompt to generate a memo. Response will stream here.
                </p>
              )}
              {completion && (
                <div className="mb-4">
                  <MarkdownBlock content={completion} />
                </div>
              )}
              {isLoading && !completion && (
                <span className="inline-block h-4 w-4 animate-pulse rounded bg-primary/50" />
              )}
              <div ref={bottomRef} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
