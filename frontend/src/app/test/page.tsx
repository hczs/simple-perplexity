import { MessageDemo } from "@/components/chat/MessageDemo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function TestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Component Test Page</h1>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Toggle Variations</CardTitle>
          <CardDescription>
            Different configurations of the theme toggle component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label>Default (icon only):</label>
            <ThemeToggle />
          </div>

          <div className="space-y-2">
            <label>With label:</label>
            <ThemeToggle showLabel />
          </div>

          <div className="space-y-2">
            <label>Different variants:</label>
            <div className="flex gap-2">
              <ThemeToggle variant="default" />
              <ThemeToggle variant="outline" />
              <ThemeToggle variant="ghost" />
            </div>
          </div>

          <div className="space-y-2">
            <label>Different sizes:</label>
            <div className="flex gap-2 items-center">
              <ThemeToggle size="sm" />
              <ThemeToggle size="default" />
              <ThemeToggle size="lg" />
            </div>
          </div>

          <div className="space-y-2">
            <label>With label and different variants:</label>
            <div className="flex gap-2">
              <ThemeToggle showLabel variant="default" />
              <ThemeToggle showLabel variant="outline" />
              <ThemeToggle showLabel variant="ghost" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UI Components Test</CardTitle>
          <CardDescription>Testing all the basic components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label>Input Component:</label>
            <Input placeholder="Type something..." />
          </div>

          <div className="space-y-2">
            <label>Button Components:</label>
            <div className="flex gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          <div className="space-y-2">
            <label>Skeleton Component:</label>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Components Test</CardTitle>
          <CardDescription>Testing the chat message components</CardDescription>
        </CardHeader>
        <CardContent>
          <MessageDemo />
        </CardContent>
      </Card>
    </div>
  );
}
