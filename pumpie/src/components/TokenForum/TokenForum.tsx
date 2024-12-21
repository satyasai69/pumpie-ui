import React, { useState } from 'react';
import { useAgentStore } from '../../services/AgentService';
import { ForumPost, ForumReply } from '../../types/forum';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface TokenForumProps {
  tokenId: string;
}

export const TokenForum: React.FC<TokenForumProps> = ({ tokenId }) => {
  const [tonConnectUI] = useTonConnectUI();
  const { forumPosts, createForumPost, addForumReply } = useAgentStore();
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  const posts = forumPosts[tokenId] || [];

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tonConnectUI.account) {
      alert('Please connect your wallet to create a post');
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    await createForumPost(tokenId, {
      title: newPostTitle,
      content: newPostContent,
      authorAddress: tonConnectUI.account.address,
      tags: [],
    });

    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleReply = async (postId: string) => {
    if (!tonConnectUI.account) {
      alert('Please connect your wallet to reply');
      return;
    }

    const content = replyContent[postId];
    if (!content?.trim()) {
      alert('Please enter a reply');
      return;
    }

    await addForumReply(tokenId, postId, {
      content,
      authorAddress: tonConnectUI.account.address,
      isAgentResponse: false,
      upvotes: 0,
      downvotes: 0,
    });

    setReplyContent(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Create New Post Form */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
        <form onSubmit={handleCreatePost}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Post Content"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full p-2 border rounded h-32"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Post
          </button>
        </form>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post: ForumPost) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-4">{post.content}</p>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span>Posted by: {post.authorAddress.slice(0, 6)}...</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Replies */}
            <div className="ml-8 space-y-4">
              {post.replies.map((reply: ForumReply) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded ${
                    reply.isAgentResponse ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <p className="mb-2">{reply.content}</p>
                  <div className="text-sm text-gray-500">
                    <span>
                      {reply.isAgentResponse ? 'Agent' : `${reply.authorAddress.slice(0, 6)}...`}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <div className="mt-4">
              <textarea
                placeholder="Write a reply..."
                value={replyContent[post.id] || ''}
                onChange={(e) =>
                  setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
              <button
                onClick={() => handleReply(post.id)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
