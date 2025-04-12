import { useEffect, useState } from "react";
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
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Alert
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    School as StudentIcon,
    Book as SubjectIcon,
    Grade as GradeIcon
} from "@mui/icons-material";
import styled from "@emotion/styled";
import * as markApi from "../services/markService";
import * as studentApi from "../services/studentService";
import * as subjectApi from "../services/subjectService";

const Container = styled.div`
    max-width: 1280px;
    margin: 0 auto;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
`;

const ActionBar = styled(Paper)`
    padding: 24px;
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const FormGrid = styled(Grid)`
    gap: 16px;
`;

const MarksList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-top: 24px;
`;

const MarkCard = styled(Card)`
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    }
`;

const MarkHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

const MarkValue = styled(Chip)`
    font-size: 16px;
    font-weight: bold;
    padding: 18px 0;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #555;
`;

export default function MarkPage() {
    const [marks, setMarks] = useState([]);
    const [students, setStudents] = useState({});
    const [subjects, setSubjects] = useState({});
    const [studentId, setStudentId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [markToDelete, setMarkToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const fetchStudents = async () => {
        try {
            const res = await studentApi.getStudents();
            const studentsMap = {};
            res.data.forEach(student => {
                studentsMap[student.id] = student.name || `Студент #${student.id}`;
            });
            setStudents(studentsMap);
        } catch (error) {
            showSnackbar("Ошибка при загрузке студентов", "error");
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await subjectApi.getSubjects();
            const subjectsMap = {};
            res.data.forEach(subject => {
                subjectsMap[subject.id] = subject.name || `Предмет #${subject.id}`;
            });
            setSubjects(subjectsMap);
        } catch (error) {
            showSnackbar("Ошибка при загрузке предметов", "error");
        }
    };

    const fetchMarks = async () => {
        setLoading(true);
        try {
            const res = await markApi.getMarks();
            setMarks(Array.from(res.data));
        } catch (error) {
            showSnackbar("Ошибка при загрузке оценок", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchMarks(), fetchStudents(), fetchSubjects()]);
        };
        fetchData();
    }, []);

    const handleAdd = async () => {
        if (!studentId || !subjectId || !value) {
            showSnackbar("Заполните все поля", "warning");
            return;
        }

        try {
            await markApi.createMark({
                studentId: parseInt(studentId),
                subjectId: parseInt(subjectId),
                value: parseInt(value)
            });
            await fetchMarks();
            setStudentId("");
            setSubjectId("");
            setValue("");
            showSnackbar("Оценка успешно добавлена", "success");
        } catch (error) {
            showSnackbar("Ошибка при добавлении оценки", "error");
        }
    };

    const confirmDelete = (id) => {
        setMarkToDelete(id);
        setOpenDialog(true);
    };

    const handleDelete = async () => {
        try {
            await markApi.deleteMark(markToDelete);
            setMarks(marks.filter(m => m.id !== markToDelete));
            setOpenDialog(false);
            showSnackbar("Оценка удалена", "success");
        } catch (error) {
            showSnackbar("Ошибка при удалении оценки", "error");
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const getMarkColor = (value) => {
        if (value >= 90) return "success";
        if (value >= 70) return "primary";
        if (value >= 50) return "warning";
        return "error";
    };

    const getStudentName = (studentId) => {
        return students[studentId] || `Студент #${studentId}`;
    };

    const getSubjectName = (subjectId) => {
        return subjects[subjectId] || `Предмет #${subjectId}`;
    };

    return (
        <Container>
            <Header>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
                    Управление оценками
                </Typography>
            </Header>

            <ActionBar elevation={0}>
                <Typography variant="h6" sx={{ marginBottom: 2, color: "#1a237e" }}>
                    Добавить новую оценку
                </Typography>

                <FormGrid container>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="ID студента"
                            type="number"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: <StudentIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="ID предмета"
                            type="number"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: <SubjectIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Значение оценки"
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: <GradeIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdd}
                            fullWidth
                            sx={{
                                bgcolor: '#1a237e',
                                '&:hover': { bgcolor: '#303f9f' },
                                borderRadius: '8px',
                                height: '40px'
                            }}
                        >
                            Добавить оценку
                        </Button>
                    </Grid>
                </FormGrid>
            </ActionBar>

            {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <CircularProgress size={60} thickness={4} sx={{ color: "#1a237e" }} />
                </div>
            ) : (
                <>
                    <Typography variant="h6" sx={{ marginBottom: 2, color: "#555" }}>
                        Все оценки ({marks.length})
                    </Typography>

                    {marks.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "#f8f9fa" }}>
                            <Typography variant="body1" color="textSecondary">
                                Оценки отсутствуют. Добавьте первую оценку выше.
                            </Typography>
                        </Paper>
                    ) : (
                        <MarksList>
                            {marks.map(mark => (
                                <MarkCard key={mark.id}>
                                    <CardContent>
                                        <MarkHeader>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                Оценка #{mark.id}
                                            </Typography>
                                            <IconButton
                                                color="error"
                                                onClick={() => confirmDelete(mark.id)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </MarkHeader>

                                        <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
                                            <MarkValue
                                                label={mark.value}
                                                color={getMarkColor(mark.value)}
                                                size="large"
                                            />
                                        </div>

                                        <InfoItem>
                                            <SubjectIcon fontSize="small" />
                                            <Typography variant="body2">
                                                Предмет: {getSubjectName(mark.subjectId)}
                                            </Typography>
                                        </InfoItem>
                                    </CardContent>
                                </MarkCard>
                            ))}
                        </MarksList>
                    )}
                </>
            )}

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Вы уверены, что хотите удалить эту оценку?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}