"use client";

import { useState } from 'react';
import type { Message } from 'ai';
import { ChevronDown, ChevronUp, Database, Server, Shield } from 'lucide-react';
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
  
  // Determine icon based on tool name
  const getToolIcon = (toolName: string) => {
    if (toolName.includes('get') || toolName.includes('list') || toolName.includes('calculate')) {
      return <Database className="h-4 w-4 mr-2" />;
    } else if (toolName.includes('create') || toolName.includes('update') || toolName.includes('delete') || toolName.includes('complete')) {
      return <Server className="h-4 w-4 mr-2" />;
    } else {
      return <Shield className="h-4 w-4 mr-2" />;
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
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Failed</Badge>;
    }
    
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Success</Badge>;
  };

  return (
    <Card className="border border-primary/10 shadow-sm bg-primary/5 mb-2">
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {getToolIcon(toolCall.name)}
            <CardTitle className="text-sm font-medium">
              {formatToolName(toolCall.name)}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </CardHeader>
      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent className="py-2 px-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-1 text-primary/70">Input</h4>
                <pre className="bg-background/50 p-2 rounded-md overflow-auto max-h-40 text-xs">
                  {JSON.stringify(toolCall.args, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-primary/70">Output</h4>
                <pre className="bg-background/50 p-2 rounded-md overflow-auto max-h-40 text-xs">
                  {result 
                    ? JSON.stringify(result.result, null, 2)
                    : "Waiting for result..."}
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter className="py-2 px-4 flex justify-end">
            <div className="text-xs text-muted-foreground">
              ID: {toolCall.id.substring(0, 8)}...
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default ToolCallDisplay; 