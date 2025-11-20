# RCF Q&A Admin Panel - User Guide

## 🔐 **Admin Access**

### **Login Credentials:**
- **URL:** `https://your-vercel-app.vercel.app/admin.html`
- **Password:** `rcfadmin123`

### **Security Features:**
- Password-protected access
- Session-based authentication
- Automatic logout on session end

## 📋 **Admin Panel Features**

### **1. Dashboard Overview**
- **Total Questions:** All submitted questions
- **Pending Answers:** Questions needing responses
- **Answered Questions:** Completed responses

### **2. Question Management**
- **View** all submitted questions
- **Answer** pending questions
- **Edit** question details
- **Delete** inappropriate questions
- **Search** through questions
- **Filter** by status or category

### **3. Answering Questions**
1. Click "Answer" button on pending questions
2. Type your response
3. Set your name as "Pastor Femi"
4. Submit answer
5. Question appears on main site as answered

### **4. Question Actions**
- **Answer:** Provide response to user's question
- **Edit:** Modify question details or category
- **View:** See full question details
- **Delete:** Remove inappropriate questions

## 📱 **How It Works**

### **Data Synchronization:**
- **Same storage** as main website
- **Real-time updates** between admin and user sites
- **Persistent storage** using browser localStorage

### **Workflow:**
1. **Users submit questions** on main site
2. **Admins receive** questions in admin panel
3. **Admins answer** pending questions
4. **Answers appear** instantly on main site
5. **Users can view** answered questions

## 🛠️ **Admin Functions**

### **Search & Filter:**
- **Search** questions by title, content, or answers
- **Filter** by status (pending/answered)
- **Filter** by category (Bible Study, Doctrine, etc.)

### **Question Status:**
- **Pending:** Needs admin response
- **Answered:** Has admin response
- **All Questions:** Both pending and answered

### **Bulk Operations:**
- **Load More:** View additional questions
- **Batch Management:** Multiple questions at once

## 🔧 **Customization**

### **Change Admin Password:**
Edit `admin-script.js` line 4:
```javascript
const ADMIN_PASSWORD = 'your-new-password';
```

### **Modify Answerer Name:**
Default is "Pastor Femi" but can be changed per response

## 📞 **Support**

### **For Technical Issues:**
- Check browser console for errors
- Ensure all files are uploaded correctly
- Verify image files are accessible

### **For Usage Questions:**
- Contact system administrator
- Review this guide for feature explanations

## 🚀 **Deployment Notes**

### **Files Required:**
1. `admin.html` - Admin interface
2. `admin-styles.css` - Admin styling
3. `admin-script.js` - Admin functionality
4. All image files (same as main site)

### **Access URLs:**
- **Main Site:** `https://your-app.vercel.app/`
- **Admin Panel:** `https://your-app.vercel.app/admin.html`

## ✅ **Best Practices**

1. **Regular Login:** Check for new questions regularly
2. **Prompt Responses:** Answer questions in a timely manner
3. **Professional Tone:** Maintain appropriate communication
4. **Review Before Publishing:** Ensure answers are accurate and helpful
5. **Data Backup:** Periodically export important questions/answers