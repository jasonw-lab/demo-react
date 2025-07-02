'use client'
import React from 'react';
import { Header } from '@/components/Header';

export default function SearchPage() {
  return (
    <div className="min-h-screen relative">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6"></h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-xl font-bold text-gray-700 py-8">工事中</p>
        </div>
      </div>
    </div>
  );
}
