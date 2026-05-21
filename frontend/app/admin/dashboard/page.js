'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('bgd_access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/posts?limit=20`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setPosts(data.items);
        } else {
          setError('Unable to load posts.');
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleDeletePost = async (id) => {
    if (!confirm('Delete this post? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setMessage('');
    const token = window.localStorage.getItem('bgd_access_token');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      const data = await response.json();

      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
        setMessage('Post deleted successfully.');
      } else {
        setMessage(data.error || 'Unable to delete post.');
      }
    } catch (err) {
      setMessage(err.message || 'Unable to delete post.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="page-shell admin-shell">
      <section className="section-heading">
        <h1 className="text-3xl font-semibold text-slate-950">Admin Dashboard</h1>
        <p className="text-slate-600">Manage blog content, categories, tags, and drafts.</p>
      </section>
      <section className="admin-actions">
        <a className="button" href="/admin/editor">Create new post</a>
      </section>
      {error ? <p className="error-message">{error}</p> : null}
      {message ? <p className="status-message">{message}</p> : null}
      <section className="table-section rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-4 px-5 text-left text-sm font-semibold text-slate-900">Title</th>
              <th className="py-4 px-5 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="py-4 px-5 text-left text-sm font-semibold text-slate-900">Category</th>
              <th className="py-4 px-5 text-left text-sm font-semibold text-slate-900">Updated</th>
              <th className="py-4 px-5 text-left text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="py-4 px-5 text-sm text-slate-700">{post.title}</td>
                <td className="py-4 px-5 text-sm text-slate-700">{post.status}</td>
                <td className="py-4 px-5 text-sm text-slate-700">{post.category}</td>
                <td className="py-4 px-5 text-sm text-slate-700">{new Date(post.updatedAt).toLocaleDateString()}</td>
                <td className="py-4 px-5 flex flex-wrap gap-2">
                  <a className="button small" href={`/admin/editor?id=${post._id}`}>
                    Edit
                  </a>
                  <button
                    type="button"
                    className="button secondary small"
                    onClick={() => handleDeletePost(post._id)}
                    disabled={deleting}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
