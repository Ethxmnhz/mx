import React, { useState, useEffect, useRef } from 'react';
import DailymotionPlayer from '../components/DailymotionPlayer';
import Html5VideoPlayer from '../components/Html5VideoPlayer';
import QuizView from '../components/QuizView';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiUrl } from '../lib/api';
import {
  PlayIcon,
  DocumentIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

// Boost Volume Button Component
function VideoBoostButton({ isDailymotion }) {
  const [boostActive, setBoostActive] = useState(false);
  const boostStateRef = useRef({ ctx: null, source: null, gain: null });

  const handleBoost = async () => {
    try {
      const state = boostStateRef.current;
      
      if (boostActive) {
        // Turn off boost
        if (state.gain) {
          state.gain.gain.value = 1.0;
        }
        setBoostActive(false);
        toast.success('Boost OFF');
        return;
      }

      // Get ANY video element on the page
      const allVideos = document.querySelectorAll('video');
      console.log(`Found ${allVideos.length} video elements`);
      
      if (allVideos.length === 0) {
        console.error('✗ No video element found on page');
        toast.error('Video player not found');
        return;
      }

      // Get the first video (should be the course video)
      const videoEl = allVideos[0];
      console.log('✓ Video element found:', videoEl);

      // Create audio context if needed
      if (!state.ctx) {
        state.ctx = new (window.AudioContext || window.webkitAudioContext)();
        console.log('✓ Audio context created');
      }

      const ctx = state.ctx;

      // Resume suspended context
      if (ctx.state === 'suspended') {
        await ctx.resume();
        console.log('✓ Audio context resumed');
      }

      // Create media source if needed
      if (!state.source) {
        try {
          state.source = ctx.createMediaElementSource(videoEl);
          console.log('✓ Media source created from video element');
        } catch (e) {
          console.error('✗ Source error:', e.message);
          toast.error('Cannot boost: ' + e.message);
          return;
        }
      }

      // Create gain node if needed
      if (!state.gain) {
        state.gain = ctx.createGain();
        state.source.connect(state.gain);
        state.gain.connect(ctx.destination);
        console.log('✓ Gain node connected');
      }

      // Boost to 3x
      state.gain.gain.value = 3.0;
      console.log('✓ Volume boosted to 3x');

      setBoostActive(true);
      toast.success('🔊 Volume boosted to 3x!');
    } catch (err) {
      console.error('✗ Error:', err);
      toast.error('Boost error: ' + err.message);
    }
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg">
      <button
        onClick={handleBoost}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all inline-flex items-center gap-2 ${
          boostActive
            ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30'
            : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
        }`}
        title={boostActive ? 'Click to turn off volume boost' : 'Click to boost volume 3x'}
      >
        <SpeakerWaveIcon className="w-4 h-4" />
        {boostActive ? '🔊 Boost ON (3x)' : '🔇 Boost Volume'}
      </button>
    </div>
  );
}

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [progress, setProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const contentTopRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Load course content
  useEffect(() => {
    checkAccessAndLoadContent();
    fetchProgress();
  }, [courseId]);

  // Load comments when active content changes
  useEffect(() => {
    if (activeContent?.id) {
      fetchComments(activeContent.id);
    }
  }, [activeContent]);

  // Auto-scroll to the content header/player on lesson change (window-level, with offset)
  useEffect(() => {
    const anchor = contentTopRef.current;
    if (!activeContent || !anchor) return;
    try {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Adjust for the sticky top bar height
      setTimeout(() => {
        window.scrollBy({ top: -80, left: 0, behavior: 'smooth' });
      }, 100);
    } catch {}
  }, [activeContent]);

  // Fetch course progress
  const fetchProgress = async () => {
    try {
      setLoadingProgress(true);
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/auth/v1/courses/${courseId}/progress`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch progress');
      const data = await response.json();
      setProgress(data.contentProgress || {});
      setOverallProgress(data.progress || 0);
      if (courseData?.content && data.contentProgress) {
        const updatedContent = courseData.content.map(content => ({
          ...content,
          completed: data.contentProgress[content.id]?.completed || false,
          watch_time: data.contentProgress[content.id]?.watch_time || 0,
          last_position: data.contentProgress[content.id]?.last_position || 0
        }));
        setCourseData(prev => ({ ...prev, content: updatedContent }));
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      toast.error('Failed to load progress');
    } finally {
      setLoadingProgress(false);
    }
  };

  // Update content progress
  const updateProgress = async (contentId, completed) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/auth/v1/content/${contentId}/progress`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed })
      });
      if (!response.ok) throw new Error('Failed to update progress');
      const data = await response.json();
      setProgress(prev => ({ ...prev, [contentId]: data }));
      fetchProgress();
      toast.success('Progress updated');
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Failed to update progress');
    }
  };

  // Handle content completion
  const handleContentComplete = async () => {
    if (!activeContent?.id) return;
    await updateProgress(activeContent.id, true);
  };

  // Handle next topic navigation
  const handleNextTopic = () => {
    if (!courseData?.content || !activeContent) return;
    
    // Find current content index
    const currentIndex = courseData.content.findIndex(c => c.id === activeContent.id);
    
    // Navigate to next content if available
    if (currentIndex !== -1 && currentIndex < courseData.content.length - 1) {
      setActiveContent(courseData.content[currentIndex + 1]);
      toast.success('Moving to next topic');
    } else {
      toast.info('You have reached the end of the course');
    }
  };

  // Check course access and load content
  const checkAccessAndLoadContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access the course');
        navigate('/login');
        return;
      }
      const response = await fetch(apiUrl(`/api/auth/v1/courses/${courseId}/access`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('You need to enroll in this course to access the content');
          navigate(`/courses/${courseId}`);
          return;
        }
        throw new Error(data.message || 'Failed to verify course access');
      }
      if (!data || !data.course) throw new Error('Invalid course data received');
      setCourseData(data);
      if (data.content && data.content.length > 0) setActiveContent(data.content[0]);
    } catch (err) {
      console.error('Error loading course:', err);
      setError(err.message || 'Failed to load course content');
      toast.error(err.message || 'Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (contentId) => {
    try {
      setLoadingComments(true);
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/auth/v1/content/${contentId}/comments`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeContent?.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/auth/v1/content/${activeContent.id}/comments`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentText.trim() })
      });
      if (!response.ok) throw new Error('Failed to submit comment');
      await fetchComments(activeContent.id);
      setCommentText('');
      toast.success('Comment posted successfully');
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Failed to post comment');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0f14] via-[#0a0f14] to-black text-slate-100">
      <div className="neon-card px-6 py-4 rounded-xl border border-white/5 text-slate-200">Loading course content...</div>
    </div>
  );
  if (error) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0f14] via-[#0a0f14] to-black text-slate-100">
      <div className="px-6 py-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200">{error}</div>
    </div>
  );
  if (!courseData || !courseData.content) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0f14] via-[#0a0f14] to-black text-slate-100">
      <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-300">No content available for this course</div>
    </div>
  );

  // Group lessons by module name, and collect module_order for sorting
  const moduleMap = {};
  courseData.content.forEach(item => {
    if (!moduleMap[item.module_name]) {
      moduleMap[item.module_name] = {
        module_order: item.module_order,
        lessons: []
      };
    }
    moduleMap[item.module_name].lessons.push(item);
  });

  // Sort modules by module_order
  const sortedModules = Object.entries(moduleMap)
    .sort((a, b) => (a[1].module_order ?? 0) - (b[1].module_order ?? 0));

  // Sort lessons within each module by order_number
  sortedModules.forEach(([_, module]) => {
    module.lessons.sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));
  });

  // Toggle module expand/collapse
  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a0f14] via-[#0a0f14] to-black text-slate-100">
      {/* Course Sidebar (Lessons) */}
      <div className="w-96 bg-[#0c1217] border-r border-white/10 overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-slate-100">{courseData?.course?.title}</h2>
          <p className="text-xs text-slate-500 mt-2">Course content</p>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Course Progress</span>
              <span className="text-emerald-300">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2 border border-white/10">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
        {/* Module List */}
        <div className="p-4 space-y-2">
          {sortedModules.map(([moduleName, module], moduleIndex) => (
            <div key={moduleIndex} className="bg-white/5 rounded-lg border border-white/10">
              <button
                onClick={() => toggleModule(moduleName)}
                className="flex items-center justify-between w-full p-4 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpenIcon className="w-5 h-5 text-emerald-300" />
                  <div className="text-left">
                    <h3 className="font-medium text-slate-100">{moduleName}</h3>
                    <p className="text-xs text-slate-500">{module.lessons.length} lessons</p>
                  </div>
                </div>
                {expandedModules[moduleName] ? (
                  <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedModules[moduleName] && (
                <div className="ml-4 mr-2 mb-4 space-y-1">
                  {module.lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveContent(lesson)}
                      className={`flex items-center w-full p-3 rounded-lg transition-colors border ${
                        activeContent?.id === lesson.id
                          ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30'
                          : 'hover:bg-white/10 border-transparent'
                      }`}
                    >
                      <div className="relative flex items-center w-full">
                        <div className="flex-shrink-0 mr-3">
                          {lesson.file_type === 'video' ? (
                            <PlayIcon className="w-5 h-5 text-emerald-300" />
                          ) : (
                            <DocumentIcon className="w-5 h-5 text-emerald-300" />
                          )}
                        </div>
                        <div className="flex-grow text-left min-w-0">
                          <p className="font-medium text-slate-100 line-clamp-1">{lesson.lesson_title}</p>
                          <div className="flex items-center text-xs text-slate-500 gap-2">
                            <span>{lesson.file_type}</span>
                            {lesson.is_preview && <span className="text-emerald-300">• Preview</span>}
                          </div>
                        </div>
                        {progress[lesson.id]?.completed && (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400 ml-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#0a0f14]/95 backdrop-blur border-b border-white/10">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">MaxSec Acadmy</span>
              <span className="text-[11px] text-slate-500">Managed by Hackosquad</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="text-slate-300 hover:text-emerald-300">Dashboard</button>
              <button onClick={() => navigate('/my-learning')} className="text-slate-300 hover:text-emerald-300">My Learning</button>
              <button onClick={() => navigate(`/courses/${courseId}`)} className="text-slate-300 hover:text-emerald-300">Course</button>
            </div>
          </div>
        </div>
        {activeContent ? (
          <div className="max-w-5xl mx-auto p-6">
            {/* Anchor to scroll to when a lesson is selected */}
            <div ref={contentTopRef} />
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {/* Content Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-100">{activeContent.lesson_title}</h1>
                    {activeContent.lesson_description && (
                      <p className="mt-2 text-slate-400">{activeContent.lesson_description}</p>
                    )}
                  </div>
                  <button
                    onClick={handleContentComplete}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors border ${
                      progress[activeContent.id]?.completed
                        ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30'
                        : 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/25'
                    }`}
                    disabled={progress[activeContent.id]?.completed}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{progress[activeContent.id]?.completed ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                </div>
              </div>
              {/* Content Body */}
              <div className="p-6">
                {activeContent.file_type === 'video' ? (
                  <div className="space-y-3">
                    {/* Boost Controls - Outside both players */}
                    <VideoBoostButton isDailymotion={!!activeContent?.embed_url} />
                    {activeContent?.embed_url ? (
                      <DailymotionPlayer 
                        embedUrl={activeContent.embed_url} 
                        title={activeContent.lesson_title}
                      />
                    ) : (
                      <Html5VideoPlayer
                        src={activeContent.file_url}
                        title={activeContent.lesson_title}
                      />
                    )}
                  </div>
                ) : activeContent.file_type === 'quiz' ? (
                  <div className="space-y-4">
                    <QuizView contentId={activeContent.id} onResult={(res) => {
                      if (res?.completed) {
                        updateProgress(activeContent.id, true);
                      }
                    }} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* PDF Viewer */}
                    <div className="relative w-full rounded-lg overflow-hidden bg-black/30 border border-white/10" style={{ height: '600px' }}>
                      <object
                        data={activeContent.file_url}
                        type="application/pdf"
                        className="absolute top-0 left-0 w-full h-full"
                      >
                        <p className="p-4 text-slate-300">PDF cannot be displayed. <a className="text-emerald-300 underline" href={activeContent.file_url} target="_blank" rel="noopener noreferrer">Download PDF</a></p>
                      </object>
                    </div>
                  </div>
                )}
              </div>
              {/* Comments Section */}
              <div className="border-t border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Discussion</h3>
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add to the discussion"
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-lg focus:border-emerald-400/50 focus:ring-0 outline-none text-slate-100 placeholder:text-slate-500"
                    rows="3"
                  />
                  <button
                    type="submit"
                    className="mt-2 px-4 py-2 bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25 rounded-lg transition-colors flex items-center gap-2"
                    disabled={!commentText.trim()}
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span>Post Comment</span>
                  </button>
                </form>
                <div className="space-y-4">
                  {loadingComments ? (
                    <div className="text-center text-slate-400">Loading comments...</div>
                  ) : comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="bg-black/30 p-4 rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-emerald-300" />
                            </div>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-100 truncate">
                                {comment.user?.full_name || comment.user?.email || 'Anonymous'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-300">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <BookOpenIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Select a lesson to begin learning</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;








