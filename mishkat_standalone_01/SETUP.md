# Mishkat IT Academy - Local Setup Guide

## প্রয়োজনীয় সফটওয়্যার
- Node.js (v18 বা তার উপরে): https://nodejs.org থেকে ডাউনলোড করো

## ইনস্টলেশন ধাপ

### ধাপ ১: ফোল্ডারে যাও
```bash
cd "Mishkat IT Academy"
```

### ধাপ ২: প্যাকেজ ইনস্টল করো
```bash
npm install
```

### ধাপ ৩: অ্যাপ চালু করো
```bash
npm run dev
```

### ধাপ ৪: ব্রাউজারে খোলো
```
http://localhost:5173
```

## ডেটা কোথায় থাকবে?
সব ডেটা তোমার ব্রাউজারের **localStorage** এ থাকবে।
তাই ইন্টারনেট ছাড়াও কাজ করবে!

## ডোমেইন/হোস্টিং এ আপলোড করতে
```bash
npm run build
```
এরপর `dist` ফোল্ডারটি হোস্টিং এ আপলোড করো।

## সমস্যা হলে
error message টা কপি করে Claude কে দেখাও।
