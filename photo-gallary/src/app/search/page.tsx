import React from 'react';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">写真検索</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            検索キーワード
          </label>
          <input
            type="text"
            id="search"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="キーワードを入力してください"
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          検索
        </button>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">検索結果</h2>
          <p className="text-gray-500">検索結果がここに表示されます</p>
        </div>
      </div>
    </div>
  );
}