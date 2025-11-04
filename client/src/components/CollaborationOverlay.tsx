import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursorX: number;
  cursorY: number;
  isActive: boolean;
}

interface CollaborationDrawing {
  id: string;
  userId: string;
  type: 'line' | 'polygon' | 'circle' | 'freehand';
  data: any;
  color: string;
  timestamp: number;
}

export function CollaborationOverlay({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [drawings, setDrawings] = useState<CollaborationDrawing[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const cursorTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize collaboration session
  useEffect(() => {
    if (!projectId || !user) return;

    const initializeSession = async () => {
      try {
        // Create collaboration session
        const session = await trpc.collaboration.createSession.mutate({
          projectId,
          userId: user.id,
          userName: user.name || 'Anonymous',
        });

        setSessionId(session.id);
        setIsCollaborating(true);

        // Connect to WebSocket (when backend is ready)
        // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // const ws = new WebSocket(`${protocol}//${window.location.host}/ws/collaboration/${session.id}`);
        // wsRef.current = ws;

        // ws.onmessage = (event) => {
        //   const message = JSON.parse(event.data);
        //   handleWebSocketMessage(message);
        // };

        // ws.onerror = (error) => {
        //   console.error('WebSocket error:', error);
        // };

        // ws.onclose = () => {
        //   setIsCollaborating(false);
        // };
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
      }
    };

    initializeSession();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId, user]);

  // Handle cursor movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sessionId || !isCollaborating) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Send cursor position via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'cursor',
          userId: user?.id,
          x,
          y,
        })
      );
    }

    // Clear previous timeout
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }

    // Hide cursor after 2 seconds of inactivity
    cursorTimeoutRef.current = setTimeout(() => {
      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === user?.id ? { ...c, isActive: false } : c
        )
      );
    }, 2000);
  };

  // Handle drawing synchronization
  const handleDrawing = (drawing: CollaborationDrawing) => {
    setDrawings((prev) => [...prev, drawing]);

    // Send drawing via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'drawing',
          drawing,
        })
      );
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'cursor':
        setCollaborators((prev) => {
          const existing = prev.find((c) => c.id === message.userId);
          if (existing) {
            return prev.map((c) =>
              c.id === message.userId
                ? {
                    ...c,
                    cursorX: message.x,
                    cursorY: message.y,
                    isActive: true,
                  }
                : c
            );
          } else {
            return [
              ...prev,
              {
                id: message.userId,
                name: message.userName,
                color: getRandomColor(),
                cursorX: message.x,
                cursorY: message.y,
                isActive: true,
              },
            ];
          }
        });
        break;

      case 'drawing':
        setDrawings((prev) => [...prev, message.drawing]);
        break;

      case 'collaborators':
        setCollaborators(message.collaborators);
        break;
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!isCollaborating) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      onMouseMove={handleMouseMove}
    >
      {/* Render collaborator cursors */}
      {collaborators.map(
        (collaborator) =>
          collaborator.isActive && (
            <div
              key={collaborator.id}
              className="absolute pointer-events-none"
              style={{
                left: `${collaborator.cursorX}px`,
                top: `${collaborator.cursorY}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Cursor */}
              <div
                className="w-4 h-4 rounded-full border-2 opacity-75"
                style={{ borderColor: collaborator.color }}
              />
              {/* User label */}
              <div
                className="text-xs font-semibold px-2 py-1 rounded whitespace-nowrap mt-1 text-white"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name}
              </div>
            </div>
          )
      )}

      {/* Render shared drawings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {drawings.map((drawing) => (
          <g key={drawing.id} opacity={0.8}>
            {drawing.type === 'line' && (
              <line
                x1={drawing.data.x1}
                y1={drawing.data.y1}
                x2={drawing.data.x2}
                y2={drawing.data.y2}
                stroke={drawing.color}
                strokeWidth="2"
              />
            )}
            {drawing.type === 'polygon' && (
              <polygon
                points={drawing.data.points}
                fill="none"
                stroke={drawing.color}
                strokeWidth="2"
              />
            )}
            {drawing.type === 'circle' && (
              <circle
                cx={drawing.data.cx}
                cy={drawing.data.cy}
                r={drawing.data.r}
                fill="none"
                stroke={drawing.color}
                strokeWidth="2"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Collaboration status */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 pointer-events-auto">
        <div className="text-sm font-semibold text-gray-800 mb-2">
          Collaborators ({collaborators.length})
        </div>
        <div className="space-y-1">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center gap-2 text-xs"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: collaborator.color }}
              />
              <span className="text-gray-700">{collaborator.name}</span>
              {collaborator.isActive && (
                <span className="text-green-600 font-semibold">●</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

