"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cookies } from "next/headers";
import {
  ArrowRight,
  BookText,
  BrainCircuit,
  HeartHand,
  LineChart,
  Loader2,
  LogOut,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { handleCheckIn, logout } from "@/app/actions";
import type { CheckInResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/logo";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

const checkInSchema = z.object({
  journalEntry: z
    .string()
    .min(30, "Please share a little more for a better analysis.")
    .max(2000, "Journal entry is too long."),
  pleasure: z.string({ required_error: "Please select an option." }),
  mood: z.string({ required_error: "Please select an option." }),
  sleep: z.string({ required_error: "Please select an option." }),
  energy: z.string({ required_error: "Please select an option." }),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

const mcqOptions = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

const mcqQuestions = [
  {
    name: "pleasure" as const,
    label:
      "Over the last two weeks, how often have you had little interest or pleasure in doing things?",
  },
  {
    name: "mood" as const,
    label:
      "How often have you been feeling down, depressed, or hopeless?",
  },
  {
    name: "sleep" as const,
    label: "How has your sleep been?",
  },
  {
    name: "energy" as const,
    label: "How has your energy level been?",
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full font-headline text-lg"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          Get My Analysis <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [userName, setUserName] = React.useState("Guest");
  const [history, setHistory] = React.useState<CheckInResult[]>([]);
  const [selectedEntry, setSelectedEntry] = React.useState<CheckInResult | null>(null);

  React.useEffect(() => {
    // This is a workaround to get cookie on the client.
    // In a real app, you'd use a proper auth provider context.
    const name = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_name="))
      ?.split("=")[1];
    setUserName(decodeURIComponent(name || "Guest"));
  }, []);

  const [state, formAction] = useFormState(handleCheckIn, null);

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      journalEntry: "",
    },
  });

  React.useEffect(() => {
    if (state) {
      if ('error' in state && state.error) {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: state.error,
        });
      } else if ('id' in state) {
        const newEntry = state as CheckInResult;
        setHistory(prev => [newEntry, ...prev]);
        setSelectedEntry(newEntry);
        form.reset();
      }
    }
  }, [state, toast, form]);


  const activeEntry = selectedEntry || history[0];

  const chartData = [...history].reverse().map((entry) => ({
    date: entry.date,
    score: entry.prediction.score,
  }));
  const chartConfig = {
    score: {
      label: "Depression Score",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="font-headline text-sm text-muted-foreground">
              Welcome, {userName}
            </span>
            <form action={logout}>
              <Button variant="ghost" size="icon" type="submit" aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto grid gap-8 px-4 py-8 md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <BookText className="h-6 w-6 text-primary" />
                  Daily Check-in
                </CardTitle>
                <CardDescription>
                  Reflect on your day. Your thoughts are safe here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form action={formAction} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="journalEntry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-headline">Your Journal Entry</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How are you feeling today? What's on your mind?"
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {mcqQuestions.map((q) => (
                      <FormField
                        key={q.name}
                        control={form.control}
                        name={q.name}
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="font-headline">{q.label}</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                {mcqOptions.map((option) => (
                                  <FormItem
                                    key={option}
                                    className="flex items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <RadioGroupItem value={option} />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    <SubmitButton />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-7 lg:col-span-8 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                  AI Analysis
                </CardTitle>
                <CardDescription>
                  Here is a summary of your check-in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 && (
                  <div className="text-center py-12">
                     <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium font-headline">No Analysis Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Complete your first check-in to see your analysis.</p>
                  </div>
                )}
                {activeEntry && (
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">Depression Score</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                <div className="relative h-32 w-32">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${activeEntry.prediction.score * 10}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl font-bold font-headline text-primary">{activeEntry.prediction.score}</span>
                                        <span className="text-lg text-muted-foreground">/10</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xl font-semibold font-headline">{activeEntry.prediction.level}</p>
                            </CardContent>
                        </Card>
                         <Collapsible asChild>
                            <Card>
                                <CardHeader>
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="font-headline text-lg">Reasoning</CardTitle>
                                            <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]>svg]:rotate-180" />
                                        </div>
                                    </CollapsibleTrigger>
                                </CardHeader>
                                <CollapsibleContent>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{activeEntry.prediction.reasoning}</p>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    </div>

                    <Card className="bg-accent/20">
                      <CardHeader className="flex-row items-center gap-2 space-y-0">
                        <HeartHand className="h-6 w-6 text-primary" />
                        <CardTitle className="font-headline text-lg">Empathetic Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{activeEntry.feedback.feedback}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-accent/20">
                      <CardHeader className="flex-row items-center gap-2 space-y-0">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <CardTitle className="font-headline text-lg">Actionable Precautions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{activeEntry.feedback.precautions}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <LineChart className="h-6 w-6 text-primary" />
                    Mental Curve
                  </CardTitle>
                  <CardDescription>
                    Your depression score trend over time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <BarChart accessibilityLayer data={chartData}>
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <YAxis domain={[0, 10]} hide />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="score" fill="var(--color-score)" radius={8} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-center h-[250px] flex flex-col justify-center">
                      <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-medium font-headline">No Data Yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Your chart will appear here after a few check-ins.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">History</CardTitle>
                  <CardDescription>
                    Review your past check-ins.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    {history.length > 0 ? (
                      <div className="space-y-4">
                        {history.map(entry => (
                          <button key={entry.id} onClick={() => setSelectedEntry(entry)} className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                            <div className="flex justify-between items-center">
                              <p className="font-bold font-headline">{entry.date}, {new Date(entry.id).getFullYear()}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold">{entry.prediction.score}/10</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  entry.prediction.score > 7 ? 'bg-destructive/20 text-destructive-foreground' : 
                                  entry.prediction.score > 4 ? 'bg-yellow-500/20 text-yellow-700' : 'bg-green-500/20 text-green-700'
                                }`}>{entry.prediction.level}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center h-full flex flex-col justify-center">
                        <p className="text-sm text-muted-foreground">No past entries.</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
