import React, { useState, useEffect } from 'react';
import { User, Note } from '../types';
import { apiService } from '../services/api';
import { clearStoredUser, getTenantColor } from '../utils/auth';
import { LogOut, Plus, Edit, Trash2, Crown, Users, FileText, AlertTriangle } from 'lucide-react';
import CreateNoteModal from './CreateNoteModal';
import EditNoteModal from './EditNoteModal';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredUser();
    apiService.clearToken();
    onLogout();
  };

  const handleCreateNote = async (noteData: { title: string; content: string }) => {
    try {
      await apiService.createNote(noteData);
      setIsCreateModalOpen(false);
      loadNotes();
    } catch (err) {
      throw err;
    }
  };

  const handleEditNote = async (id: string, noteData: { title: string; content: string }) => {
    try {
      await apiService.updateNote(id, noteData);
      setEditingNote(null);
      loadNotes();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await apiService.deleteNote(id);
      loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleUpgrade = async () => {
    if (!confirm('Upgrade to Pro plan? This will remove the note limit.')) return;

    try {
      setIsUpgrading(true);
      await apiService.upgradeTenant(user.tenant.slug);
      // Refresh user data (in real app, you'd want to update the user context)
      alert('Successfully upgraded to Pro! You now have unlimited notes.');
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upgrade');
    } finally {
      setIsUpgrading(false);
    }
  };

  const tenantGradient = getTenantColor(user.tenant.slug);
  const canCreateNote = user.tenant.plan === 'pro' || notes.length < user.tenant.noteLimit;
  const isNearLimit = user.tenant.plan === 'free' && notes.length >= user.tenant.noteLimit - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`bg-gradient-to-r ${tenantGradient} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white">{user.tenant.name} Notes</h1>
                <p className="text-xs text-gray-200">
                  {user.role === 'admin' ? 'Administrator' : 'Member'} • {user.tenant.plan.toUpperCase()} Plan
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user.tenant.plan === 'free' && user.role === 'admin' && (
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {isUpgrading ? 'Upgrading...' : 'Upgrade to Pro'}
                </button>
              )}

              <span className="text-white text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Notes</h2>
            <p className="text-gray-600 mt-1">
              {user.tenant.plan === 'free' 
                ? `${notes.length} of ${user.tenant.noteLimit} notes used`
                : `${notes.length} notes`
              }
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canCreateNote}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Note
          </button>
        </div>

        {/* Limit Warning */}
        {isNearLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-yellow-800 font-medium">
                  You're approaching your note limit
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  {user.role === 'admin' 
                    ? 'Upgrade to Pro for unlimited notes.'
                    : 'Ask your admin to upgrade to Pro for unlimited notes.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Notes Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first note.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {note.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {note.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>By {note.authorId.email}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="flex items-center px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateNoteModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateNote}
        />
      )}

      {editingNote && (
        <EditNoteModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSubmit={(noteData) => handleEditNote(editingNote._id, noteData)}
        />
      )}
    </div>
  );
}