import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  Pin,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Table,
  HelpCircle,
  CheckCircle,
  MessageSquare,
  Users as UsersIcon,
  BookOpen,
  X,
  Download,
} from 'lucide-react';
import { useYieldX, Message, MessageType } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/app/components/ui/dialog';
import { toast } from 'sonner';

interface ChatHubProps {
  workspaceId: string;
  teamId?: string;
}

export function ChatHub({ workspaceId, teamId }: ChatHubProps) {
  const { user, messages, sendMessage, pinMessage, toggleHelpTag, getWorkspaceMessages } = useYieldX();
  const [activeTab, setActiveTab] = useState('chat');
  const [messageInput, setMessageInput] = useState('');
  const [isRubric, setIsRubric] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const workspaceMessages = getWorkspaceMessages(workspaceId, teamId);
  const pinnedMessages = workspaceMessages.filter((m) => m.pinned);
  const helpMessages = workspaceMessages.filter((m) => m.helpTag && !m.pinned);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [workspaceMessages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const type: MessageType = teamId ? 'team' : 'guidance';
    sendMessage(workspaceId, messageInput, type, teamId);
    setMessageInput('');
    toast.success('تم إرسال الرسالة');
  };

  const handlePinMessage = (messageId: string) => {
    pinMessage(messageId);
    toast.success('تم تثبيت/إلغاء تثبيت الرسالة');
  };

  const handleToggleHelp = (messageId: string) => {
    toggleHelpTag(messageId);
    const message = messages.find((m) => m.id === messageId);
    if (message?.helpTag) {
      toast.success('تم إزالة علامة المساعدة');
    } else {
      toast.success('تم وضع علامة المساعدة - سيتم إشعار المدرس');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage and get URL
      toast.success(`تم إرفاق الملف: ${file.name}`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lecturer':
        return 'text-purple-400';
      case 'student':
        return 'text-blue-400';
      default:
        return 'text-green-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'lecturer':
        return '🟣';
      case 'student':
        return '🔵';
      default:
        return '🟢';
    }
  };

  const MessageCard = ({ message }: { message: Message }) => {
    const isOwnMessage = message.sender.id === user?.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-4 ${isOwnMessage ? 'ml-8' : 'mr-8'}`}
      >
        <Card
          className={`p-4 ${
            message.pinned
              ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/50'
              : message.helpTag
              ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/50'
              : message.isRubric
              ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50'
              : isOwnMessage
              ? 'bg-purple-500/20 border-purple-500/30'
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getRoleIcon(message.sender.role)}</span>
              <span className={`font-semibold ${getRoleColor(message.sender.role)}`}>
                {message.sender.name}
              </span>
              {message.sender.role === 'lecturer' && (
                <Badge className="bg-purple-500/30 text-purple-300 text-xs">مدرس</Badge>
              )}
              {message.isRubric && (
                <Badge className="bg-cyan-500/30 text-cyan-300 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  معيار تقييم
                </Badge>
              )}
            </div>
            <span className="text-xs text-purple-300">
              {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <p className="text-white text-sm mb-3 whitespace-pre-wrap">{message.content}</p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg text-xs"
                >
                  {attachment.type === 'pdf' && <FileText className="w-4 h-4 text-red-400" />}
                  {attachment.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-400" />}
                  {attachment.type === 'table' && <Table className="w-4 h-4 text-green-400" />}
                  <span className="text-white">{attachment.name}</span>
                  <Download className="w-3 h-3 text-purple-400 cursor-pointer hover:text-purple-300" />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            {user?.role === 'lecturer' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePinMessage(message.id)}
                className={`text-xs ${
                  message.pinned ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Pin className={`w-3 h-3 mr-1 ${message.pinned ? 'fill-current' : ''}`} />
                {message.pinned ? 'إلغاء التثبيت' : 'تثبيت'}
              </Button>
            )}

            {user?.role === 'student' && !isOwnMessage && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleHelp(message.id)}
                className={`text-xs ${
                  message.helpTag ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                {message.helpTag ? 'إزالة المساعدة' : 'احتاج مساعدة'}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-slate-800 border-purple-500/30 mb-4">
          <TabsTrigger value="chat" className="data-[state=active]:bg-purple-500/20">
            <MessageSquare className="w-4 h-4 mr-2" />
            المحادثات
            {helpMessages.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                {helpMessages.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-500/20">
            <CheckCircle className="w-4 h-4 mr-2" />
            المهام
          </TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-purple-500/20">
            <Paperclip className="w-4 h-4 mr-2" />
            الملفات
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-500/20">
            <BookOpen className="w-4 h-4 mr-2" />
            التقدم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
          {/* Pinned Messages */}
          {pinnedMessages.length > 0 && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold mb-2">
                <Pin className="w-4 h-4" />
                <span>الرسائل المثبتة</span>
              </div>
              {pinnedMessages.map((message) => (
                <Card
                  key={message.id}
                  className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${getRoleColor(message.sender.role)}`}>
                          {message.sender.name}
                        </span>
                      </div>
                      <p className="text-white text-sm">{message.content}</p>
                    </div>
                    {user?.role === 'lecturer' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePinMessage(message.id)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Help Messages Alert (for teachers) */}
          {user?.role === 'lecturer' && helpMessages.length > 0 && (
            <div className="mb-4">
              <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50 p-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-semibold">طلبات مساعدة جديدة</p>
                    <p className="text-red-300 text-sm">{helpMessages.length} طالب يحتاج للمساعدة</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full pr-4" ref={scrollRef}>
              {workspaceMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageSquare className="w-16 h-16 text-purple-400 mb-4" />
                  <h3 className="text-white text-lg mb-2">لا توجد رسائل بعد</h3>
                  <p className="text-purple-300 text-sm">ابدأ المحادثة مع {teamId ? 'فريقك' : 'المدرس'}</p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {workspaceMessages
                    .filter((m) => !m.pinned)
                    .map((message) => (
                      <MessageCard key={message.id} message={message} />
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Input */}
          <div className="mt-4 pt-4 border-t border-purple-500/30">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={teamId ? 'اكتب رسالة للفريق...' : 'اكتب رسالتك...'}
                  className="bg-slate-800 border-purple-500/30 text-white resize-none"
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-800 border-purple-500/30 hover:bg-slate-700"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-purple-500/50">
                    <DialogHeader>
                      <DialogTitle className="text-white">إرفاق ملف</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        يمكنك إرفاق ملفات PDF، صور، أو جداول بيانات
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        className="bg-slate-800 border-purple-500/30 text-white"
                        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          صورة
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-green-500/20 border-green-500/30 hover:bg-green-500/30"
                        >
                          <Table className="w-4 h-4 mr-2" />
                          جدول
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {user?.role === 'lecturer' && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="rubric"
                  checked={isRubric}
                  onChange={(e) => setIsRubric(e.target.checked)}
                  className="rounded border-purple-500/30"
                />
                <label htmlFor="rubric" className="text-sm text-purple-300 cursor-pointer">
                  إرسال كمعيار تقييم / قائمة تدقيق
                </label>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="flex-1 mt-0">
          <Card className="bg-slate-800/50 border-purple-500/30 p-6 h-full">
            <h3 className="text-white text-lg mb-4">المهام المطلوبة</h3>
            <div className="space-y-3">
              <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-semibold mb-1">إكمال تحليل السوق</h4>
                    <p className="text-purple-300 text-sm">الموعد النهائي: الخميس</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-300">قيد التنفيذ</Badge>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="flex-1 mt-0">
          <Card className="bg-slate-800/50 border-purple-500/30 p-6 h-full">
            <h3 className="text-white text-lg mb-4">الملفات المرفقة</h3>
            <div className="space-y-2">
              <p className="text-purple-300 text-sm text-center py-8">لا توجد ملفات مرفقة بعد</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="flex-1 mt-0">
          <Card className="bg-slate-800/50 border-purple-500/30 p-6 h-full">
            <h3 className="text-white text-lg mb-4">تقدم المشروع</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">معلومات المساهمين</span>
                  <Badge className="bg-green-500/20 text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    مكتمل
                  </Badge>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">تحليل المنافسين</span>
                  <Badge className="bg-yellow-500/20 text-yellow-300">قيد التنفيذ</Badge>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}