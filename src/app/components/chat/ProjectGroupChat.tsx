import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, Trash2, Volume2, VolumeX, Megaphone, User, AlertCircle, Info } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { toast } from 'sonner';

interface ProjectGroupChatProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectGroupChat({ projectId, projectName, isOpen, onClose }: ProjectGroupChatProps) {
  const { 
    user, 
    language, 
    getProjectChat, 
    sendChatMessage, 
    deleteChatMessage, 
    muteStudent, 
    unmuteStudent,
    markChatAsRead
  } = useYieldX();
  
  const [message, setMessage] = useState('');
  const [isAnnouncementMode, setIsAnnouncementMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const projectChat = getProjectChat(projectId);
  const messages = projectChat?.messages || [];
  const mutedStudents = projectChat?.mutedStudents || [];
  const isTeacher = user?.role === 'lecturer';
  const isMuted = mutedStudents.includes(user?.id || '');

  // Mark chat as read when opened
  useEffect(() => {
    if (isOpen && user?.id) {
      markChatAsRead(projectId, user.id);
    }
  }, [isOpen, projectId, user?.id, markChatAsRead]);

  // Translations
  const t = {
    projectChat: language === 'ar' ? 'محادثة المشروع' : 'Project Chat',
    typeMessage: language === 'ar' ? 'اكتب رسالة...' : 'Type a message...',
    send: language === 'ar' ? 'إرسال' : 'Send',
    you: language === 'ar' ? 'أنت' : 'You',
    teacher: language === 'ar' ? 'المدرس' : 'Teacher',
    announcement: language === 'ar' ? 'إعلان' : 'Announcement',
    deleted: language === 'ar' ? 'تم حذف الرسالة' : 'Message deleted',
    muted: language === 'ar' ? 'تم كتم صوتك من قبل المدرس' : 'You have been muted by the teacher',
    noMessages: language === 'ar' ? 'لا توجد رسائل' : 'No messages yet',
    startConversation: language === 'ar' ? 'ابدأ المحادثة مع فريقك' : 'Start the conversation with your team',
    announcementMode: language === 'ar' ? 'وضع الإعلان' : 'Announcement Mode',
    normalMode: language === 'ar' ? 'وضع عادي' : 'Normal Mode',
    muteStudent: language === 'ar' ? 'كتم الصوت' : 'Mute',
    unmuteStudent: language === 'ar' ? 'إلغاء الكتم' : 'Unmute',
    deleteMessage: language === 'ar' ? 'حذف' : 'Delete',
    messageTooLong: language === 'ar' ? 'الرسالة طويلة جداً (الحد الأقصى 500 حرف)' : 'Message too long (max 500 characters)',
    messageSent: language === 'ar' ? 'تم إرسال الرسالة' : 'Message sent',
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (message.length > 500) {
      toast.error(t.messageTooLong);
      return;
    }

    sendChatMessage(projectId, message.trim(), isAnnouncementMode);
    setMessage('');
    setIsAnnouncementMode(false);
    toast.success(t.messageSent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteChatMessage(projectId, messageId);
  };

  const handleMuteToggle = (studentId: string) => {
    if (mutedStudents.includes(studentId)) {
      unmuteStudent(projectId, studentId);
    } else {
      muteStudent(projectId, studentId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl h-[80vh] bg-white dark:bg-[#1B1B3A] flex flex-col"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div>{t.projectChat}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                {projectName}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 py-4">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noMessages}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t.startConversation}</p>
              </motion.div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.senderId === user?.id;
                const isMsgDeleted = msg.deleted;

                return (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {/* Sender Info */}
                      {!isOwnMessage && (
                        <div className="flex items-center gap-2 px-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {msg.senderName}
                            {msg.senderRole === 'lecturer' && (
                              <Badge className="ml-1 bg-orange-500 text-white text-xs">
                                {t.teacher}
                              </Badge>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`relative group ${
                          isMsgDeleted
                            ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                            : msg.isAnnouncement
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-[#0F0F25] text-gray-900 dark:text-white'
                        } px-4 py-2 rounded-2xl shadow-sm ${
                          isOwnMessage ? 'rounded-tr-sm' : 'rounded-tl-sm'
                        }`}
                      >
                        {msg.isAnnouncement && (
                          <div className="flex items-center gap-1 mb-1">
                            <Megaphone className="w-3 h-3" />
                            <span className="text-xs font-semibold">{t.announcement}</span>
                          </div>
                        )}
                        
                        {isMsgDeleted ? (
                          <p className="text-sm italic text-gray-500 dark:text-gray-400">
                            {t.deleted}
                          </p>
                        ) : (
                          <p className="text-sm break-words">{msg.message}</p>
                        )}

                        {/* Teacher Controls */}
                        {isTeacher && !isMsgDeleted && !isOwnMessage && (
                          <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => handleDeleteMessage(msg.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={mutedStudents.includes(msg.senderId) ? 'default' : 'secondary'}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => handleMuteToggle(msg.senderId)}
                            >
                              {mutedStudents.includes(msg.senderId) ? (
                                <Volume2 className="w-3 h-3" />
                              ) : (
                                <VolumeX className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Delete button for own messages */}
                        {isOwnMessage && !isMsgDeleted && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute -left-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleDeleteMessage(msg.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-gray-400 px-2">
                        {new Date(msg.timestamp).toLocaleString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Muted Warning */}
        {isMuted && !isTeacher && (
          <div className="p-3 bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <p className="text-sm text-orange-600 dark:text-orange-400">{t.muted}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Teacher Announcement Toggle */}
          {isTeacher && (
            <div className="mb-3 flex items-center gap-2">
              <Button
                size="sm"
                variant={isAnnouncementMode ? 'default' : 'outline'}
                onClick={() => setIsAnnouncementMode(!isAnnouncementMode)}
                className={
                  isAnnouncementMode
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                    : ''
                }
              >
                <Megaphone className="w-3 h-3 mr-1" />
                {isAnnouncementMode ? t.announcementMode : t.normalMode}
              </Button>
              {isAnnouncementMode && (
                <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {language === 'ar' ? 'سيتم إرسال الرسالة كإعلان' : 'Message will be sent as announcement'}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.typeMessage}
              disabled={isMuted && !isTeacher}
              className="flex-1"
              maxLength={500}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || (isMuted && !isTeacher)}
              className={
                isAnnouncementMode
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              }
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">
            {message.length}/500
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}