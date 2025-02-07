"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";

import { config } from "~/components/providers/WagmiProvider";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE, QUIZ_QUESTIONS, RESULT_MESSAGES } from "~/lib/constants";

function QuizCard({ currentStep, onAnswer, answers, score }: { 
  currentStep: number;
  onAnswer: (answerIndex: number) => void;
  answers: number[];
  score: number;
}) {
  const question = QUIZ_QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUIZ_QUESTIONS.length - 1;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maschine Capabilities Quiz</CardTitle>
        <CardDescription>
          {currentStep + 1} of {QUIZ_QUESTIONS.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{question.question}</h3>
        
        <div className="flex flex-col gap-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              {option}
            </button>
          ))}
        </div>

        {isLastQuestion && (
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <h4 className="font-semibold">Your Score: {score}/{QUIZ_QUESTIONS.length}</h4>
            <p className="text-sm mt-1">
              {RESULT_MESSAGES[Math.floor((score / QUIZ_QUESTIONS.length) * RESULT_MESSAGES.length)]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-700 dark:text-gray-300">
          {PROJECT_TITLE}
        </h1>
        <QuizCard 
          currentStep={currentStep}
          onAnswer={(answerIndex) => {
            const newAnswers = [...answers, answerIndex];
            setAnswers(newAnswers);
            
            // Calculate score
            const newScore = newAnswers.reduce((acc, answer, index) => {
              return acc + (answer === QUIZ_QUESTIONS[index].correctAnswer ? 1 : 0);
            }, 0);
            setScore(newScore);

            // Advance or reset quiz
            if (currentStep < QUIZ_QUESTIONS.length - 1) {
              setCurrentStep(step => step + 1);
            } else {
              setTimeout(() => {
                setCurrentStep(0);
                setAnswers([]);
                setScore(0);
              }, 3000);
            }
          }}
          answers={answers}
          score={score}
        />
      </div>
    </div>
  );
}
