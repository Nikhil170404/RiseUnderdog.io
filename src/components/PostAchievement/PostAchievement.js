import React, { useState } from 'react';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const PostAchievement = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    setLoading(true);
    let mediaUrl = '';

    if (image) {
      const imageRef = ref(storage, `achievements/${image.name}`);
      await uploadBytes(imageRef, image);
      mediaUrl = await getDownloadURL(imageRef);
    }

    const postsCollectionRef = collection(firestore, 'posts'); // Get reference to the 'posts' collection

    await addDoc(postsCollectionRef, {
      title,
      content,
      author: 'User ID or Name',
      createdAt: new Date(),
      mediaUrl,
    });

    setLoading(false);
    setTitle('');
    setContent('');
    setImage(null);
  };

  return (
    <div className="post-achievement">
      <h2>Post Achievement</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button onClick={handlePost} disabled={loading}>
        {loading ? 'Posting...' : 'Post Achievement'}
      </button>
    </div>
  );
};

export default PostAchievement;
