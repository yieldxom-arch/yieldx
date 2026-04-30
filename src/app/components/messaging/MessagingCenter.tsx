import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  User,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Flag,
  Mail,
  ArrowRight,
  Folder,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ProjectGroupChat } from '@/app/components/chat/ProjectGroupChat';

type MessageType = 'general' | 'report' | 'help';
type MessageStatus = 'sent' | 'read' | 'replied';

interface Message {
  id: string;
  type: MessageType;
  subject: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  reply?: string;
  replyTimestamp?: string;
}

export function MessagingCenter() {
  const { setCurrentView, user, language, translations, workspaces, getProjectChat, getUnreadMessageCount, markChatAsRead } = useYieldX();
  const t = translations.messaging;
  const isRTL = language === 'ar';

  const [showNewMessage, setShowNewMessage] = useState(false);
  const [messageType, setMessageType] = useState<MessageType>('general');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [filterType, setFilterType] = useState<'all' | MessageType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatProjectId, setChatProjectId] = useState<string | null>(null);
  const [chatProjectName, setChatProjectName] = useState<string>('');

  // Empty messages array - no fake data until platform launches
  // In a real implementation, this would fetch from backend
  const [messages, setMessages] = useState<Message[]>([]);

  // Filter projects based on user role
  const userProjects = workspaces.filter((w) => {
    if (user?.role === 'lecturer') {
      // Teachers see projects they created
      return w.createdBy === user.id;
    } else {
      // Students see projects they're assigned to (forked)
      return w.createdBy === user?.id && w.forkedFrom;
    }
  });

  const handleSendMessage = () => {
    if (!subject.trim() || !content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: messageType,
      subject,
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setMessages([newMessage, ...messages]);
    setSubject('');
    setContent('');
    setShowNewMessage(false);
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filterType === 'all' || msg.type === filterType;
    const matchesSearch =
      msg.subject.includes(searchQuery) ||
      msg.content.includes(searchQuery) ||
      (msg.reply && msg.reply.includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'report':
        return <Flag className="w-5 h-5 text-red-500" />;
      case 'help':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Mail className="w-5 h-5 text-blue-500" />;
    }
  };

  const getMessageTypeLabel = (type: MessageType) => {
    switch (type) {
      case 'report':
        return t.report;
      case 'help':
        return t.help;
      default:
        return t.general;
    }
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'replied':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'read':
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: MessageStatus) => {
    switch (status) {
      case 'replied':
        return t.replied;
      case 'read':
        return t.pending;
      default:
        return t.sent;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] p-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setCurrentView('dashboard')}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-50 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 hover:border-[#4ECDC4] text-gray-700 dark:text-gray-300 rounded-lg transition-all shadow-sm hover:shadow-md group"
      >
        <ArrowRight className={`w-5 h-5 group-hover:${isRTL ? 'translate-x-1' : '-translate-x-1'} transition-transform ${isRTL ? '' : 'rotate-180'}`} />
        <span className="font-semibold">{t.backToDashboard}</span>
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewMessage(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {t.newMessage}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl p-1 mb-6">
          <TabsTrigger value="messages" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4ECDC4] data-[state=active]:to-[#7FDBCA] data-[state=active]:text-white">
            {language === 'ar' ? 'الرسائل والبلاغات' : 'Messages & Reports'}
          </TabsTrigger>
          <TabsTrigger value="project-chats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4ECDC4] data-[state=active]:to-[#7FDBCA] data-[state=active]:text-white">
            {language === 'ar' ? 'محادثات المشاريع' : 'Project Chats'}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Messages & Reports */}
        <TabsContent value="messages">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors shadow-sm`}
              />
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl px-4 py-3 shadow-sm">
              <Filter className="w-5 h-5 text-[#4ECDC4]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | MessageType)}
                className="bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#1B1B3A]">
                  {t.allMessages}
                </option>
                <option value="general" className="bg-white dark:bg-[#1B1B3A]">
                  {t.general}
                </option>
                <option value="help" className="bg-white dark:bg-[#1B1B3A]">
                  {t.help}
                </option>
                <option value="report" className="bg-white dark:bg-[#1B1B3A]">
                  {t.report}
                </option>
              </select>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        {getMessageTypeIcon(message.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{message.subject}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            {getMessageTypeLabel(message.type)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(message.timestamp).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon(message.status)}
                      <span className="text-gray-600 dark:text-gray-400">{getStatusLabel(message.status)}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4 pr-13">{message.content}</p>

                  {message.reply && (
                    <div className={`bg-gradient-to-r from-[#4ECDC4]/10 to-[#7FDBCA]/10 ${isRTL ? 'border-r-4' : 'border-l-4'} border-[#4ECDC4] rounded-lg p-4 ${isRTL ? 'pr-4' : 'pl-4'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-[#4ECDC4]" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{t.teacherReply}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.replyTimestamp &&
                            new Date(message.replyTimestamp).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{message.reply}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl"
              >
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">{t.noMessages}</p>
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Project Chats */}
        <TabsContent value="project-chats">
          <div className="space-y-4">
            {userProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl"
              >
                <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {language === 'ar' ? 'لا توجد محادثات مشاريع بعد' : 'No project chats available yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'ستظهر محادثات المشاريع هنا عندما تنضم إلى مشروع' : 'Project chats will appear here when you join a project'}
                </p>
              </motion.div>
            ) : (
              userProjects.map((workspace) => {
                const projectChat = getProjectChat(workspace.id);
                const unreadCount = getUnreadMessageCount(workspace.id, user?.id || '');

                return (
                  <motion.div
                    key={workspace.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-white dark:bg-[#1B1B3A]/50 border-purple-200 dark:border-[#4ECDC4]/20 p-6 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                              {workspace.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs">
                                {user?.role === 'lecturer' 
                                  ? (language === 'ar' ? 'مدير المشروع' : 'Project Manager')
                                  : (language === 'ar' ? 'عضو' : 'Member')
                                }
                              </Badge>
                              {unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  {language === 'ar' ? `${unreadCount} جديد` : `${unreadCount} new`}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setChatProjectId(workspace.id);
                            setChatProjectName(workspace.name);
                            markChatAsRead(workspace.id, user?.id || '');
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          <MessageSquare className="w-5 h-5" />
                          {language === 'ar' ? 'فتح المحادثة' : 'Open Chat'}
                        </motion.button>
                      </div>

                      {workspace.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {workspace.description}
                        </p>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewMessage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/30 rounded-2xl max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-purple-200 dark:border-[#4ECDC4]/20">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.newMessageTitle}</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Message Type */}
                <div>
                  <label className="block text-slate-900 dark:text-white font-semibold mb-2">{t.messageType}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['general', 'help', 'report'] as MessageType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setMessageType(type)}
                        className={`p-3 rounded-lg border transition-all ${
                          messageType === type
                            ? 'border-[#4ECDC4] bg-[#4ECDC4]/10'
                            : 'border-purple-200 dark:border-[#4ECDC4]/20 hover:border-[#4ECDC4]/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {getMessageTypeIcon(type)}
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {getMessageTypeLabel(type)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-slate-900 dark:text-white font-semibold mb-2">{t.subjectRequired}</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t.subjectPlaceholder}
                    className="w-full bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-slate-900 dark:text-white font-semibold mb-2">{t.messageRequired}</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t.messagePlaceholder}
                    rows={6}
                    className="w-full bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-purple-200 dark:border-[#4ECDC4]/20 flex gap-3">
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!subject.trim() || !content.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {t.send}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Group Chat Modal */}
      {chatProjectId && (
        <ProjectGroupChat
          projectId={chatProjectId}
          projectName={chatProjectName}
          isOpen={!!chatProjectId}
          onClose={() => {
            setChatProjectId(null);
            setChatProjectName('');
          }}
        />
      )}
    </div>
  );
}