import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['Development', 'Design', 'Business', 'Marketing', 'IT & Software', 'Personal Development', 'Photography', 'Music'];

const createCourse = async (formData) => {
    const res = await api.post('/courses', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

const CreateCoursePage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('0');
    const [category, setCategory] = useState('Development');
    const [thumbnailFile, setThumbnailFile] = useState(null);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
            queryClient.invalidateQueries(['courses']);
            queryClient.invalidateQueries(['createdCourses']);
            navigate('/');
        },
        onError: (err) => {
            alert(err.response?.data?.msg || 'Error creating course');
        }
    });

    const onFileChange = (e) => {
        setThumbnailFile(e.target.files[0]);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (mutation.isPending) return;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        mutation.mutate(formData);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-md">
                <h1 className="text-3xl font-bold mb-6">Create Your Channel</h1>
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Channel Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter your channel name"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded h-32"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Price ($)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                            min="0"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">Thumbnail Image</label>
                        <input
                            type="file"
                            onChange={onFileChange}
                            className="w-full p-2 border rounded"
                            accept="image/*"
                        />
                        <p className="text-sm text-gray-500 mt-1">Upload an image (jpg, png, webp)</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Creating...' : 'Create Channel'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCoursePage;
