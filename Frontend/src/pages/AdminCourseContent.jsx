import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import QuizBuilder from '../components/QuizBuilder';
import {
  PlayIcon,
  DocumentIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';



const AdminCourseContent = () => {
  // Move module up/down
  const handleMoveModule = async (moduleName, direction) => {
    try {
      const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
      const module = contents.find(m => m.module_name === moduleName);
      if (!module) return;
      const response = await fetch(`${API_BASE}/api/admin/courses/${courseId}/modules/${module.module_id}/move`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ direction })
      });
      if (!response.ok) throw new Error('Failed to move module');
      toast.success('Module moved');
      fetchContents();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to move module');
    }
  };

  // Move topic up/down
  const handleMoveTopic = async (contentId, direction) => {
    try {
      const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents/${contentId}/move`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ direction })
      });
      if (!response.ok) throw new Error('Failed to move topic');
      toast.success('Topic moved');
      fetchContents();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to move topic');
    }
  };
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [editingModule, setEditingModule] = useState(null); // module_name
  const [moduleEditValue, setModuleEditValue] = useState('');
  const [editingContent, setEditingContent] = useState(null); // content id
  const [contentEditValue, setContentEditValue] = useState('');
  const [contentEditPreview, setContentEditPreview] = useState(false);
  const [contentEditType, setContentEditType] = useState('file');
  const [contentEditFile, setContentEditFile] = useState(null);
  const [contentEditEmbed, setContentEditEmbed] = useState('');
  const [contentEditQuizObj, setContentEditQuizObj] = useState(null);
  // Add Topic state
  const [addingModule, setAddingModule] = useState(null); // module_name
  const [addTitle, setAddTitle] = useState('');
  const [addPreview, setAddPreview] = useState(false);
  const [addType, setAddType] = useState('file');
  const [addFile, setAddFile] = useState(null);
  const [addEmbed, setAddEmbed] = useState('');
  const [addQuizObj, setAddQuizObj] = useState(null);

  const resetAddForm = () => {
    setAddingModule(null);
    setAddTitle('');
    setAddPreview(false);
    setAddType('file');
    setAddFile(null);
    setAddEmbed('');
    setAddQuizObj(null);
  };

  // Fetch course contents
  useEffect(() => {
    fetchContents();
  }, [courseId]);

  const fetchContents = async () => {
    try {
      const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch contents');
      const data = await response.json();
      setContents(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load course contents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${API_BASE}/api/admin/courses/contents/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete content');
      
      toast.success('Content deleted successfully');
      fetchContents(); // Refresh the contents list
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete content');
    }
  };

  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  if (loading) return <AdminLayout title="Course Content"><div className="flex justify-center p-8 text-slate-300">Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Course Content">
      <div className="max-w-6xl mx-auto p-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-slate-100">Course Content Management</h1>
          <button
            onClick={() => navigate(`/admin/courses/${courseId}/upload`)}
            className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Content
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl">
          {contents.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No content available. Click "Add Content" to get started.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {[...contents].sort((a, b) => (a.module_order ?? 0) - (b.module_order ?? 0)).map((module, i) => (
                <div key={module.module_name} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleModule(module.module_name)}>
                        <span className="text-xs text-slate-400 mr-1">#{module.module_order ?? i + 1}</span>
                        {editingModule === module.module_name ? (
                          <input value={moduleEditValue} onChange={(e) => setModuleEditValue(e.target.value)} className="bg-black/20 p-1 rounded text-slate-100" />
                        ) : (
                          <h3 className="text-base font-medium text-slate-100">{module.module_name}</h3>
                        )}
                        {expandedModules[module.module_name] ? (
                          <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      {editingModule === module.module_name ? (
                        <div className="flex items-center gap-2 ml-2">
                          <button onClick={async () => {
                            try {
                              const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
                              const moduleRec = contents.find(m => m.module_name === module.module_name);
                              if (!moduleRec) throw new Error('Module not found');
                              const token = localStorage.getItem('token');
                              const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/modules/${moduleRec.module_id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ module_name: moduleEditValue })
                              });
                              if (!res.ok) throw new Error('Failed to update module');
                              toast.success('Module name updated');
                              setEditingModule(null);
                              fetchContents();
                            } catch (err) {
                              console.error(err);
                              toast.error('Failed to update module');
                            }
                          }} className="text-emerald-300 px-2 py-1 rounded bg-emerald-600/10">Save</button>
                          <button onClick={() => { setEditingModule(null); setModuleEditValue(''); }} className="px-2 py-1 rounded bg-white/5">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingModule(module.module_name); setModuleEditValue(module.module_name); }} className="text-slate-400 ml-2 hover:text-slate-200">Edit</button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button title="Move Up" onClick={() => handleMoveModule(module.module_name, 'up')} className="p-1 rounded hover:bg-emerald-700/30">
                        <ChevronUpIcon className="w-4 h-4 text-emerald-300" />
                      </button>
                      <button title="Move Down" onClick={() => handleMoveModule(module.module_name, 'down')} className="p-1 rounded hover:bg-emerald-700/30">
                        <ChevronDownIcon className="w-4 h-4 text-emerald-300" />
                      </button>
                    </div>
                  </div>

                  {expandedModules[module.module_name] && (
                    <div className="mt-3 space-y-3">
                      {/* Add Topic Toggle */}
                      {addingModule === module.module_name ? (
                        <div className="p-3 bg-black/20 border border-white/10 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input className="p-2 bg-black/30 border border-white/10 rounded text-slate-100" placeholder="Lesson title" value={addTitle} onChange={(e)=>setAddTitle(e.target.value)} />
                            <select className="p-2 bg-black/30 border border-white/10 rounded text-slate-100" value={addType} onChange={(e)=>setAddType(e.target.value)}>
                              <option value="file">File Upload</option>
                              <option value="dailymotion">Dailymotion</option>
                              <option value="quiz">Quiz</option>
                            </select>
                          </div>
                          <div className="mt-3">
                            {addType === 'file' && (
                              <input type="file" onChange={(e)=>setAddFile(e.target.files[0])} className="text-slate-200" />
                            )}
                            {addType === 'dailymotion' && (
                              <input type="text" placeholder="Dailymotion URL" value={addEmbed} onChange={(e)=>setAddEmbed(e.target.value)} className="w-full p-2 bg-black/30 border border-white/10 rounded text-slate-100" />
                            )}
                            {addType === 'quiz' && (
                              <div className="p-0">
                                <QuizBuilder value={addQuizObj || undefined} onChange={(obj)=>setAddQuizObj(obj)} />
                              </div>
                            )}
                          </div>
                          <label className="inline-flex items-center gap-2 text-xs text-slate-400 mt-3">
                            <input type="checkbox" checked={addPreview} onChange={(e)=>setAddPreview(e.target.checked)} /> Preview
                          </label>
                          <div className="mt-3 flex gap-2">
                            <button
                              className="px-3 py-1.5 text-xs rounded bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25"
                              onClick={async()=>{
                                try {
                                  if (!addTitle.trim()) { toast.error('Title required'); return; }
                                  const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
                                  const token = localStorage.getItem('token');
                                  // Determine next order number
                                  const maxOrder = (module.contents || []).reduce((m,c)=> Math.max(m, c?.order_number ?? 0), 0);
                                  const order_number = (maxOrder || 0) + 1;
                                  if (addType === 'file' && addFile) {
                                    const fd = new FormData();
                                    fd.append('file', addFile);
                                    fd.append('module_name', module.module_name);
                                    fd.append('lesson_title', addTitle);
                                    fd.append('order_number', String(order_number));
                                    fd.append('is_preview', addPreview);
                                    const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
                                    if (!res.ok) throw new Error('Upload failed');
                                  } else if (addType === 'dailymotion') {
                                    const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ module_name: module.module_name, lesson_title: addTitle, order_number, is_preview: addPreview, embed_url: addEmbed, file_type: 'video' }) });
                                    if (!res.ok) throw new Error('Upload failed');
                                  } else if (addType === 'quiz') {
                                    const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ module_name: module.module_name, lesson_title: addTitle, order_number, is_preview: addPreview, quiz: JSON.stringify(addQuizObj || {}) }) });
                                    if (!res.ok) throw new Error('Upload failed');
                                  } else {
                                    toast.error('Please provide a file or valid input'); return;
                                  }
                                  toast.success('Topic added');
                                  resetAddForm();
                                  fetchContents();
                                } catch (e) {
                                  console.error(e);
                                  toast.error('Failed to add topic');
                                }
                              }}
                            >Save Topic</button>
                            <button className="px-3 py-1.5 text-xs rounded bg-white/5 border border-white/10" onClick={resetAddForm}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="mb-2 px-3 py-1.5 text-xs rounded bg-emerald-500/10 text-emerald-200 border border-emerald-400/20 hover:bg-emerald-500/20"
                          onClick={()=>{ setAddingModule(module.module_name); setAddTitle(''); setAddType('file'); setAddPreview(false); setAddFile(null); setAddEmbed(''); setAddQuizObj(null); }}
                        >+ Add Topic</button>
                      )}

                      {module.contents.map((content, idx) => (
                        <div
                          key={content.id}
                          className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {content.file_type === 'video' ? (
                              <PlayIcon className="w-5 h-5 text-emerald-300" />
                            ) : (
                              <DocumentIcon className="w-5 h-5 text-emerald-300" />
                            )}
                            <div>
                              {editingContent === content.id ? (
                                <div className="flex flex-col gap-2">
                                  <input className="p-1 bg-black/20 rounded text-slate-100" value={contentEditValue} onChange={(e) => setContentEditValue(e.target.value)} />
                                  <label className="text-xs text-slate-400"><input type="checkbox" checked={contentEditPreview} onChange={(e) => setContentEditPreview(e.target.checked)} className="mr-1"/> Preview</label>
                                  <select className="p-1 bg-black/20 rounded text-slate-100" value={contentEditType} onChange={(e) => setContentEditType(e.target.value)}>
                                    <option value="file">File Upload</option>
                                    <option value="dailymotion">Dailymotion</option>
                                    <option value="quiz">Quiz</option>
                                  </select>
                                  {contentEditType === 'file' && (
                                    <input type="file" onChange={(e) => setContentEditFile(e.target.files[0])} className="text-slate-200" />
                                  )}
                                  {contentEditType === 'dailymotion' && (
                                    <input type="text" placeholder="Dailymotion URL" value={contentEditEmbed} onChange={(e) => setContentEditEmbed(e.target.value)} className="p-1 bg-black/20 rounded text-slate-100" />
                                  )}
                                  {contentEditType === 'quiz' && (
                                    <div className="p-0">
                                      <QuizBuilder value={contentEditQuizObj} onChange={(obj) => setContentEditQuizObj(obj)} />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <p className="font-medium text-slate-100">{content.lesson_title}</p>
                                  <p className="text-xs text-slate-500">{content.file_type} {content.is_preview && '• Preview'}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button title="Move Up" onClick={() => handleMoveTopic(content.id, 'up')} className="p-1 rounded hover:bg-emerald-700/30">
                              <ChevronUpIcon className="w-4 h-4 text-emerald-300" />
                            </button>
                            <button title="Move Down" onClick={() => handleMoveTopic(content.id, 'down')} className="p-1 rounded hover:bg-emerald-700/30">
                              <ChevronDownIcon className="w-4 h-4 text-emerald-300" />
                            </button>
                            {editingContent === content.id ? (
                              <>
                                <button onClick={async () => {
                                  try {
                                    const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
                                    const token = localStorage.getItem('token');
                                    // If file attached, use FormData
                                    if (contentEditType === 'file' && contentEditFile) {
                                      const fd = new FormData();
                                      fd.append('file', contentEditFile);
                                      fd.append('lesson_title', contentEditValue);
                                      fd.append('is_preview', contentEditPreview);
                                      const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents/${content.id}`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: fd
                                      });
                                      if (!res.ok) throw new Error('Failed to update content');
                                    } else if (contentEditType === 'dailymotion') {
                                      const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents/${content.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ lesson_title: contentEditValue, is_preview: contentEditPreview, embed_url: contentEditEmbed })
                                      });
                                      if (!res.ok) throw new Error('Failed to update content');
                                    } else if (contentEditType === 'quiz') {
                                      const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents/${content.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ lesson_title: contentEditValue, is_preview: contentEditPreview, quiz: JSON.stringify(contentEditQuizObj) })
                                      });
                                      if (!res.ok) throw new Error('Failed to update content');
                                    } else {
                                      const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/contents/${content.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ lesson_title: contentEditValue, is_preview: contentEditPreview })
                                      });
                                      if (!res.ok) throw new Error('Failed to update content');
                                    }

                                    toast.success('Content updated');
                                    setEditingContent(null);
                                    setContentEditFile(null);
                                    setContentEditEmbed('');
                                    setContentEditQuizObj(null);
                                    fetchContents();
                                  } catch (err) {
                                    console.error(err);
                                    toast.error('Failed to update content');
                                  }
                                }} className="px-3 py-1.5 text-xs rounded bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25 ml-2">Save</button>
                                <button onClick={() => { setEditingContent(null); setContentEditValue(''); setContentEditPreview(false); }} className="px-3 py-1.5 text-xs rounded bg-white/5 ml-2">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditingContent(content.id); setContentEditValue(content.lesson_title); setContentEditPreview(!!content.is_preview); }} className="px-3 py-1.5 text-xs rounded bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25 ml-2">Edit</button>
                                <button
                                  onClick={() => handleDeleteContent(content.id)}
                                  className="px-3 py-1.5 text-xs rounded bg-red-500/15 text-red-200 border border-red-400/30 hover:bg-red-500/25 ml-2"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCourseContent;