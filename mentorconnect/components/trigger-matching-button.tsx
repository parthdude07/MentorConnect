"use client";

import { useState } from "react";
import { runMatchingAlgorithm } from "@/app/actions/matching";
import { Button } from "@/components/ui/button";

export function TriggerMatchingButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleMatch = async () => {
    setLoading(true);
    try {
      const res = await runMatchingAlgorithm(userId);
      setResult(res);
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-muted/50 rounded-lg mt-4 border border-border">
      <h3 className="font-semibold text-lg">Test Match Algorithm</h3>
      <p className="text-sm text-muted-foreground">
        Click to run the matching algorithm and generate mentor predictions for this user.
      </p>
      <Button onClick={handleMatch} disabled={loading} className="w-fit">
        {loading ? "Running..." : "Run Matching Algorithm"}
      </Button>
      {result && (
        <pre className="mt-4 p-4 bg-black text-green-400 text-xs rounded overflow-auto max-h-60">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
