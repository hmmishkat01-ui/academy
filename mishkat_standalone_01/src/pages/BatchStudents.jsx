import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    ArrowLeft, Users, Phone, Mail, Eye, BookOpen, Calendar,
    Layers, CheckCircle2, Clock, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function BatchStudents() {
    const [batch, setBatch] = useState(null);
    const [course, setCourse] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const batchId = urlParams.get('id');
            if (!batchId) { setLoading(false); return; }

            const [batchData, enrollmentsData] = await Promise.all([
                base44.entities.Batch.filter({ id: batchId }),
                base44.entities.Enrollment.filter({ batch_id: batchId })
            ]);

            if (batchData.length > 0) {
                setBatch(batchData[0]);
                const [courseData, modulesData] = await Promise.all([
                    base44.entities.Course.filter({ id: batchData[0].course_id }),
                    base44.entities.CourseModule.filter({ course_id: batchData[0].course_id })
                ]);
                if (courseData.length > 0) setCourse(courseData[0]);
                setModules(modulesData.sort((a, b) => (a.class_number || 0) - (b.class_number || 0)));
            }

            setEnrollments(enrollmentsData || []);

            if (enrollmentsData && enrollmentsData.length > 0) {
                const studentIds = enrollmentsData.map(e => e.student_id);
                const studentsData = await base44.entities.Student.list();
                setStudents(studentsData.filter(s => studentIds.includes(s.id)));
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setStudents([]);
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    };

    const getStudentEnrollment = (studentId) => enrollments.find(e => e.student_id === studentId);

    const paymentStatusColors = {
        paid: 'bg-emerald-100 text-emerald-700',
        partial: 'bg-amber-100 text-amber-700',
        unpaid: 'bg-red-100 text-red-700',
        free: 'bg-blue-100 text-blue-700'
    };
    const paymentStatusLabels = { paid: 'পেইড', partial: 'আংশিক', unpaid: 'বাকি', free: 'ফ্রি' };
    const statusColors = {
        active: 'bg-green-100 text-green-700',
        completed: 'bg-blue-100 text-blue-700',
        dropped: 'bg-red-100 text-red-700'
    };
    const statusLabels = { active: 'চলমান', completed: 'সম্পন্ন', dropped: 'বাদ' };

    const calculateStats = () => ({
        totalPaid: enrollments.reduce((sum, e) => sum + (e.amount_paid || 0), 0),
        totalDue: enrollments.reduce((sum, e) => sum + (e.due_amount || 0), 0),
        completedCount: enrollments.filter(e => e.status === 'completed').length,
        certificateCount: enrollments.filter(e => e.certificate_issued).length,
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500 mb-4">ব্যাচ পাওয়া যায়নি</p>
                <Link to={createPageUrl('Batches')}>
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        ব্যাচ লিস্টে ফিরুন
                    </Button>
                </Link>
            </div>
        );
    }

    const stats = calculateStats();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to={createPageUrl('Batches')}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-800">{batch.batch_number}</h1>
                    <p className="text-slate-500">{batch.course_name || course?.name || 'কোর্স'}</p>
                </div>
                <Badge className={statusColors[batch.status] || 'bg-slate-100 text-slate-700'}>
                    {statusLabels[batch.status] || batch.status}
                </Badge>
            </div>

            {/* Batch Info Card */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-[var(--primary-color)] to-[#2d4a6f]" />
                <CardContent className="relative pt-0 pb-6 px-6">
                    <div className="-mt-12 flex flex-col md:flex-row gap-4">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/80 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white">
                            {batch.batch_number?.match(/\d+/)?.[0] || 'B'}
                        </div>
                        <div className="flex-1 pt-0 md:pt-14">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">মোট স্টুডেন্ট</p>
                                    <p className="text-2xl font-bold text-slate-800">{students.length} জন</p>
                                </div>
                                {course && (
                                    <>
                                        <div>
                                            <p className="text-sm text-slate-500">কোর্স ফি</p>
                                            <p className="text-2xl font-bold text-slate-800">
                                                {course.is_free ? 'ফ্রি' : `৳${course.price}`}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">মোট ক্লাস</p>
                                            <p className="text-2xl font-bold text-slate-800">{course.total_classes || 0}</p>
                                        </div>
                                    </>
                                )}
                                {batch.start_date && (
                                    <div>
                                        <p className="text-sm text-slate-500">শুরুর তারিখ</p>
                                        <p className="text-lg font-semibold text-slate-800">
                                            {new Date(batch.start_date).toLocaleDateString('bn-BD')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Batch Statistics */}
            {enrollments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-500 mb-1">মোট আয়</p>
                            <p className="text-2xl font-bold text-emerald-600">৳{stats.totalPaid.toLocaleString('bn-BD')}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-500 mb-1">মোট বাকি</p>
                            <p className="text-2xl font-bold text-red-600">৳{stats.totalDue.toLocaleString('bn-BD')}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-500 mb-1">সম্পন্ন</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.completedCount} জন</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-500 mb-1">সার্টিফিকেট</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.certificateCount} টি</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Tabs */}
            <Tabs defaultValue="students">
                <TabsList className="mb-4">
                    <TabsTrigger value="students" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        স্টুডেন্ট ({students.length})
                    </TabsTrigger>
                    <TabsTrigger value="modules" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        মডিউল ({modules.length})
                    </TabsTrigger>
                </TabsList>

                {/* Students Tab */}
                <TabsContent value="students">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-[var(--primary-color)]" />
                                স্টুডেন্ট লিস্ট ({students.length} জন)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {students.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 mb-4">এই ব্যাচে এখনো কোনো স্টুডেন্ট নেই</p>
                                    <Link to={createPageUrl('Students')}>
                                        <Button className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90">স্টুডেন্ট যোগ করুন</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {students.map((student) => {
                                        const enrollment = getStudentEnrollment(student.id);
                                        return (
                                            <Card key={student.id} className="border shadow-sm hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        {student.photo_url ? (
                                                            <img src={student.photo_url} alt={student.name} className="h-14 w-14 rounded-xl object-cover" />
                                                        ) : (
                                                            <div className="h-14 w-14 rounded-xl bg-[var(--primary-color)] flex items-center justify-center text-white text-lg font-bold">
                                                                {student.name?.[0] || 'S'}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-slate-800 truncate">{student.name}</h3>
                                                            <p className="text-xs text-slate-500">রোল: {student.roll_number}</p>
                                                            {enrollment && (
                                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                                    <Badge className={`text-xs ${paymentStatusColors[enrollment.payment_status]}`}>
                                                                        {paymentStatusLabels[enrollment.payment_status]}
                                                                    </Badge>
                                                                    <Badge className={`text-xs ${statusColors[enrollment.status]}`}>
                                                                        {statusLabels[enrollment.status]}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 text-xs text-slate-600 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            <span>{student.phone}</span>
                                                        </div>
                                                        {student.email && (
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="h-3 w-3 text-slate-400" />
                                                                <span className="truncate">{student.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Link to={createPageUrl(`StudentProfile?id=${student.id}`)} className="block">
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            প্রোফাইল দেখুন
                                                        </Button>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Modules Tab */}
                <TabsContent value="modules">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-[var(--primary-color)]" />
                                কোর্স মডিউলসমূহ ({modules.length} টি)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {modules.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Layers className="h-12 w-12 mx-auto mb-2 opacity-40" />
                                    <p>এই কোর্সে এখনো কোনো মডিউল যোগ করা হয়নি।</p>
                                    <p className="text-sm mt-1">কোর্স পেজ থেকে মডিউল যোগ করুন।</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {modules.map((m) => (
                                        <div key={m.id} className={`p-4 rounded-xl border-l-4 ${
                                            m.status === 'completed' ? 'border-emerald-500 bg-emerald-50' :
                                            m.status === 'cancelled' ? 'border-red-300 bg-red-50' :
                                            'border-[var(--primary-color)] bg-slate-50'
                                        }`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                                                    m.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-[var(--primary-color)] text-white'
                                                }`}>
                                                    {m.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : m.class_number}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-semibold text-slate-800">ক্লাস {m.class_number}: {m.title}</p>
                                                        <Badge className={
                                                            m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            m.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }>
                                                            {m.status === 'completed' ? 'সম্পন্ন' : m.status === 'cancelled' ? 'বাতিল' : 'আসন্ন'}
                                                        </Badge>
                                                    </div>
                                                    {m.description && <p className="text-sm text-slate-600 mt-1">{m.description}</p>}
                                                    <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-slate-500">
                                                        {m.scheduled_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(m.scheduled_date).toLocaleDateString('bn-BD')}
                                                            </span>
                                                        )}
                                                        {m.duration_minutes && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {m.duration_minutes} মিনিট
                                                            </span>
                                                        )}
                                                        {m.resource_url && (
                                                            <a href={m.resource_url} target="_blank" rel="noopener noreferrer"
                                                               className="flex items-center gap-1 text-blue-600 hover:underline">
                                                                <LinkIcon className="h-3 w-3" />
                                                                রিসোর্স দেখুন
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}