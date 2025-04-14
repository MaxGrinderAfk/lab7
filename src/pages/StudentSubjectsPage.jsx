import { useState, useEffect } from "react";
import {
    Button,
    Paper,
    IconButton,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Snackbar,
    Alert,
    Box,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import {
    Link as LinkIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Book as BookIcon,
    School as SchoolIcon
} from "@mui/icons-material";
import styled from "@emotion/styled";
import * as api from "../services/studentSubjectService";

const Container = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
`;

const SectionPaper = styled(Paper)`
    padding: 24px;
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-top: 24px;
`;

export default function StudentSubjectsPage() {
    // Поля для имен
    const [studentName, setStudentName] = useState("");
    const [subjectName, setSubjectName] = useState("");

    // Списки для выпадающих меню
    const [availableStudents, setAvailableStudents] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    // Результаты запросов
    const [subjects, setSubjects] = useState([]);

    // Состояния UI
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    useEffect(() => {
        // Загрузка списков студентов и предметов при монтировании компонента
        const fetchLists = async () => {
            try {
                const [studentsRes, subjectsRes] = await Promise.all([
                    api.getAllStudents(),
                    api.getAllSubjects()
                ]);
                setAvailableStudents(studentsRes.data);
                setAvailableSubjects(subjectsRes.data);
            } catch (error) {
                showSnackbar("Ошибка загрузки списков студентов и предметов", "error");
            }
        };

        fetchLists();
    }, []);

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Новый метод для получения студента с предметами по ID
    const fetchStudentWithSubjects = async (studentId) => {
        setLoading(true);
        try {
            const res = await api.getStudentWithSubjects(studentId);
            setSubjects(res.data.subjects || []);
            if (!res.data.subjects || res.data.subjects.length === 0) {
                showSnackbar("У студента нет предметов", "info");
            }
        } catch (error) {
            showSnackbar("Ошибка загрузки студента с предметами", "error");
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    // Модифицированный метод поиска студента по имени
    const fetchStudentSubjectsByName = async () => {
        if (!studentName) {
            showSnackbar("Выберите имя студента", "warning");
            return;
        }

        setLoading(true);
        try {
            // Находим студента в списке по имени
            const student = availableStudents.find(s => s.name === studentName);

            if (!student) {
                showSnackbar("Студент не найден", "error");
                setSubjects([]);
                setLoading(false);
                return;
            }

            // Вызываем API с ID студента
            await fetchStudentWithSubjects(student.id);
        } catch (error) {
            showSnackbar("Ошибка при поиске студента", "error");
            setSubjects([]);
            setLoading(false);
        }
    };

    const handleLinkByName = async () => {
        if (!studentName || !subjectName) {
            showSnackbar("Выберите студента и предмет", "warning");
            return;
        }

        try {
            await api.addSubjectToStudentByNames(studentName, subjectName);

            // Находим студента в списке по имени для получения ID
            const student = availableStudents.find(s => s.name === studentName);
            if (student) {
                await fetchStudentWithSubjects(student.id);
            } else {
                await fetchStudentSubjectsByName(); // Фолбэк на старый метод
            }

            showSnackbar("Связь успешно добавлена", "success");
        } catch (error) {
            showSnackbar("Ошибка создания связи", "error");
        }
    };

    const handleUnlinkByName = async (subject) => {
        try {
            await api.removeSubjectFromStudentByNames(studentName, subject.name);

            // Находим студента в списке по имени для получения ID
            const student = availableStudents.find(s => s.name === studentName);
            if (student) {
                await fetchStudentWithSubjects(student.id);
            } else {
                await fetchStudentSubjectsByName(); // Фолбэк на старый метод
            }

            showSnackbar("Связь успешно удалена", "success");
        } catch (error) {
            showSnackbar("Ошибка удаления связи", "error");
        }
    };

    return (
        <Container>
            <Header>
                <SchoolIcon fontSize="large" color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Управление связями Студент-Предмет
                </Typography>
            </Header>

            <SectionPaper elevation={0}>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
                    Создание новой связи по имени
                </Typography>

                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel id="student-select-label">Студент</InputLabel>
                            <Select
                                labelId="student-select-label"
                                value={studentName}
                                label="Студент"
                                onChange={(e) => setStudentName(e.target.value)}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                }
                            >
                                {availableStudents.map((student) => (
                                    <MenuItem key={student.id} value={student.name}>
                                        {student.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel id="subject-select-label">Предмет</InputLabel>
                            <Select
                                labelId="subject-select-label"
                                value={subjectName}
                                label="Предмет"
                                onChange={(e) => setSubjectName(e.target.value)}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <BookIcon color="action" />
                                    </InputAdornment>
                                }
                            >
                                {availableSubjects.map((subject) => (
                                    <MenuItem key={subject.id} value={subject.name}>
                                        {subject.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<LinkIcon />}
                            onClick={handleLinkByName}
                            sx={{ py: 1.5, borderRadius: 2 }}
                        >
                            Связать
                        </Button>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<PersonIcon />}
                        onClick={fetchStudentSubjectsByName}
                    >
                        Показать предметы студента
                    </Button>
                </Box>
            </SectionPaper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={60} thickness={4} color="primary" />
                </Box>
            ) : (
                <>
                    {subjects.length > 0 && (
                        <SectionPaper elevation={0}>
                            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                                <PersonIcon color="primary" sx={{ mr: 1 }} />
                                {`Предметы студента "${studentName}"`}
                            </Typography>

                            <ResultsGrid>
                                {subjects.map((subject) => (
                                    <Card key={subject.id} sx={{ position: 'relative' }}>
                                        <CardContent>
                                            <Typography variant="h6">
                                                {subject.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ID: {subject.id}
                                            </Typography>
                                        </CardContent>
                                        <IconButton
                                            onClick={() => handleUnlinkByName(subject)}
                                            sx={{ position: 'absolute', top: 8, right: 8 }}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Card>
                                ))}
                            </ResultsGrid>
                        </SectionPaper>
                    )}
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    elevation={6}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}