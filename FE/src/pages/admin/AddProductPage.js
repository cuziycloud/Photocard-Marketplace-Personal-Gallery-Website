import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8080/api';

const AddProductPage = () => {
    const [productName, setProductName] = useState('');
    const [groupId, setGroupId] = useState(''); 
    const [version, setVersion] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');

    const [groups, setGroups] = useState([]); 
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            setLoadingGroups(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/groups`);
                setGroups(response.data || []);
                if (response.data && response.data.length > 0) {
                    setGroupId(response.data[0].id); 
                }
            } catch (error) {
                console.error("Error fetching groups:", error);
                setSubmitError("Không thể tải danh sách nhóm."); 
            } finally {
                setLoadingGroups(false);
            }
        };
        fetchGroups();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!productName || !groupId || !price || !stockQuantity) {
            setSubmitError("Vui lòng điền đầy đủ các trường bắt buộc: Tên, Nhóm, Giá, Số lượng.");
            setIsSubmitting(false);
            return;
        }

        const productData = {
            name: productName,
            group: groups.find(g => g.id === parseInt(groupId)), 
            version: version || null, 
            description: description || null,
            price: parseFloat(price),
            imageUrl: imageUrl || null,
            stockQuantity: parseInt(stockQuantity),
        };
        
        console.log("Submitting product data:", productData);


        try {
            const response = await axios.post(`${API_BASE_URL}/products`, productData);
            console.log("Product created:", response.data);
            setSubmitSuccess(true);
            setProductName('');
            setGroupId(groups.length > 0 ? groups[0].id : '');
            setVersion('');
            setDescription('');
            setPrice('');
            setImageUrl('');
            setStockQuantity('');
        } catch (error) {
            console.error("Error creating product:", error.response?.data || error.message);
            setSubmitError(error.response?.data?.message || error.response?.data || "Lỗi khi tạo sản phẩm. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8" style={{ paddingTop: '100px' }}>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-8">Thêm sản phẩm mới</h2>

                {submitSuccess && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">
                        Sản phẩm đã được thêm thành công!
                    </div>
                )}
                {submitError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                        Lỗi: {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-slate-700">
                            Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="group" className="block text-sm font-medium text-slate-700">
                            Nhóm nhạc <span className="text-red-500">*</span>
                        </label>
                        {loadingGroups ? (
                            <p className="text-sm text-slate-500">Đang tải danh sách nhóm...</p>
                        ) : groups.length === 0 && !loadingGroups ? (
                             <p className="text-sm text-red-500">Không có nhóm nào. Vui lòng thêm nhóm trước.</p>
                        ) : (
                            <select
                                id="group"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label htmlFor="version" className="block text-sm font-medium text-slate-700">
                            Phiên bản (Version)
                        </label>
                        <input
                            type="text"
                            id="version"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-slate-700">
                            Giá <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="stockQuantity" className="block text-sm font-medium text-slate-700">
                            Số lượng tồn kho <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="stockQuantity"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(e.target.value)}
                            required
                            min="0"
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700">
                            URL Hình ảnh
                        </label>
                        <input
                            type="url"
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                            Mô tả
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || loadingGroups || (groups.length === 0 && !loadingGroups)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <FaSpinner className="animate-spin mr-2" />
                            ) : null}
                            {isSubmitting ? 'Đang thêm...' : 'Thêm sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductPage;