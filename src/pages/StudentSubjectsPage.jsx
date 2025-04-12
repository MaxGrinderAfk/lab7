import { useState } from "react";
import {
    TextField,
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
    InputAdornment
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
    const [studentId, setStudentId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const fetchStudentSubjects = async () => {
        if (!studentId) {
            showSnackbar("Введите ID студента", "warning");
            return;
        }

        setLoading(true);
        try {
            const res = await api.getSubjectsByStudent(studentId);
            setSubjects(res.data);
        } catch {
            showSnackbar("Ошибка загрузки предметов", "error");
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLink = async () => {
        if (!studentId || !subjectId) {
            showSnackbar("Заполните оба поля", "warning");
            return;
        }

        try {
            await api.addSubjectToStudent(studentId, subjectId);
            await fetchStudentSubjects();
            setSubjectId("");
            showSnackbar("Связь успешно добавлена", "success");
        } catch {
            showSnackbar("Ошибка создания связи", "error");
        }
    };

    const handleUnlink = async (subjectId) => {
        try {
            await api.removeSubjectFromStudent(studentId, subjectId);
            await fetchStudentSubjects();
            showSnackbar("Связь успешно удалена", "success");
        } catch {
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
                    Создание новой связи
                </Typography>

                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="ID студента"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="ID предмета"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BookIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<LinkIcon />}
                            onClick={handleLink}
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
                        onClick={fetchStudentSubjects}
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
                                Предметы студента #{studentId}
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
                                            onClick={() => handleUnlink(subject.id)}
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

                    {students.length > 0 && (
                        <SectionPaper elevation={0}>
                            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                                <BookIcon color="primary" sx={{ mr: 1 }} />
                                Студенты предмета #{subjectId}
                            </Typography>

                            <ResultsGrid>
                                {students.map((student) => (
                                    <Card key={student.id}>
                                        <CardContent>
                                            <Typography variant="h6">
                                                {student.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Возраст: {student.age}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </ResultsGrid>
                        </SectionPaper>
                    )}
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    onClose={handleCloseSnackbar}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
