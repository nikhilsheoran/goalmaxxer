"use client";

import { useState } from 'react';
import type { Message } from 'ai';
import { ChevronDown, ChevronUp, Database, Server, Shield, LineChart, Target, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

// Define interfaces for tools based on the AI SDK
interface ToolCallInvocation {
  id: string;
  name: string;
  args: Record<string, any>;
}

interface ToolCallResult {
  id: string;
  result: any;
}

interface ToolCallDisplayProps {
  toolCall: ToolCallInvocation;
  result?: ToolCallResult;
}

export function ToolCallDisplay({ toolCall, result }: ToolCallDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine icon and color based on tool name
  const getToolDetails = (toolName: string) => {
    switch (toolName) {
      case 'getDashboardStats':
        return {
          icon: <LineChart className="h-4 w-4 mr-2" />,
          color: 'text-blue-500',
          label: 'Get Dashboard Stats'
        };
      case 'createNewGoal':
        return {
          icon: <Target className="h-4 w-4 mr-2" />,
          color: 'text-green-500',
          label: 'Create New Goal'
        };
      case 'getSuggestions':
        return {
          icon: <Shield className="h-4 w-4 mr-2" />,
          color: 'text-purple-500',
          label: 'Get Investment Suggestions'
        };
      case 'createNewAsset':
        return {
          icon: <Wallet className="h-4 w-4 mr-2" />,
          color: 'text-orange-500',
          label: 'Create New Asset'
        };
      default:
        return {
          icon: <Database className="h-4 w-4 mr-2" />,
          color: 'text-gray-500',
          label: formatToolName(toolName)
        };
    }
  };

  // Format tool name to be more readable
  const formatToolName = (toolName: string) => {
    return toolName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  // Format the status badge based on result
  const getStatusBadge = () => {
    if (!result) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Processing</Badge>;
    }
    
    if (result.result?.success === false) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
          {result.result?.error || 'Failed'}
        </Badge>
      );
    }
    
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Success</Badge>;
  };

  // Format the result for display
  const formatResult = (result: any) => {
    if (!result) return 'Waiting for result...';

    // Remove success flag from display
    const { success, ...displayResult } = result;
    return JSON.stringify(displayResult, null, 2);
  };

  const toolDetails = getToolDetails(toolCall.name);

  return (
    <Card className="border border-primary/10 shadow-sm bg-primary/5 mb-2 w-full max-w-full overflow-hidden">
      <CardHeader className="py-2 px-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className={toolDetails.color}>{toolDetails.icon}</span>
            <CardTitle className="text-xs font-medium ml-1">
              {toolDetails.label}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {getStatusBadge()}
            <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </CardHeader>
      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent className="py-2 px-3 text-xs">
            <div className="flex flex-col space-y-3">
              <div>
                <h4 className="font-semibold mb-1 text-primary/70">Input</h4>
                <pre className="w-full bg-background/50 p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all text-[10px] leading-relaxed">
                  {JSON.stringify(toolCall.args, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-primary/70">Output</h4>
                <pre className="w-full bg-background/50 p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all text-[10px] leading-relaxed">
                  {result ? formatResult(result.result) : "Waiting for result..."}
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter className="py-1 px-3 flex justify-end">
            <div className="text-[10px] text-muted-foreground">
              ID: {toolCall.id.substring(0, 8)}...
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default ToolCallDisplay; 