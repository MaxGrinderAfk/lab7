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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Alert,
    Box,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    AccessTime as AgeIcon,
    Group as GroupIcon,
    Grade as GradeIcon
} from "@mui/icons-material";
import styled from "@emotion/styled";
import * as studentApi from "../services/studentService";
import * as groupApi from "../services/groupService";

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

const StudentsList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-top: 24px;
`;

const StudentCard = styled(Card)`
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    }
`;

const StudentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    color: #555;
`;

const EditContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 16px 0;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 16px;
`;

const SectionTitle = styled(Typography)`
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const InfoBox = styled(Box)`
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
    margin-top: 8px;
`;

const MarkItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #fff;
    border-radius: 4px;
    margin: 4px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

export default function StudentPage() {
    const [students, setStudents] = useState([]);
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [groupId, setGroupId] = useState("");
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });
    const [updatingStudentId, setUpdatingStudentId] = useState(null);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await studentApi.getStudents();
            setStudents(res.data);
        } catch (error) {
            console.error("Ошибка при загрузке студентов:", error);
            showSnackbar("Ошибка при загрузке студентов", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        setLoadingGroups(true);
        try {
            const res = await groupApi.getGroups();
            setGroups(res.data);
        } catch (error) {
            console.error("Ошибка при загрузке групп:", error);
            showSnackbar("Ошибка при загрузке групп", "error");
        } finally {
            setLoadingGroups(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchStudents();
            await fetchGroups();
        };
        fetchData();
    }, []);

    const handleAdd = async () => {
        if (!name || !age) {
            showSnackbar("Заполните все обязательные поля", "warning");
            return;
        }

        const tempId = Date.now();

        try {
            const newStudent = {
                name,
                age: parseInt(age),
                group: groupId ? { id: parseInt(groupId) } : null
            };

            setStudents(prev => [
                ...prev,
                {
                    ...newStudent,
                    id: tempId,
                    subjects: [],
                    marks: []
                }
            ]);

            const res = await studentApi.createStudent(newStudent);

            setStudents(prev =>
                prev.map(st =>
                    st.id === tempId ? res.data : st
                )
            );

            setName("");
            setAge("");
            setGroupId("");
            showSnackbar("Студент успешно добавлен", "success");
        } catch (error) {
            console.error("Ошибка при добавлении студента:", error);
            setStudents(prev => prev.filter(st => st.id !== tempId));
            showSnackbar("Ошибка при добавлении студента", "error");
        }
    };

    const handleUpdate = async (studentId) => {
        if (updatingStudentId === studentId) return;

        setUpdatingStudentId(studentId);

        try {
            const studentToUpdate = students.find(s => s.id === studentId);

            if (!studentToUpdate) {
                showSnackbar("Студент не найден", "error");
                return;
            }

            const updatedName = studentToUpdate.name || "";
            const updatedAge = studentToUpdate.age !== undefined && studentToUpdate.age !== ""
                ? parseInt(studentToUpdate.age)
                : "";

            await studentApi.updateStudent(studentId, updatedName, updatedAge);

            setStudents(prev =>
                prev.map(st =>
                    st.id === studentId
                        ? { ...st, name: updatedName, age: updatedAge }
                        : st
                )
            );

            showSnackbar("Данные студента обновлены", "success");
        } catch (error) {
            console.error("Ошибка при обновлении данных:", error);
            showSnackbar(`Ошибка при обновлении: ${error.message || "неизвестная ошибка"}`, "error");
        } finally {
            setUpdatingStudentId(null);
        }
    };

    const confirmDelete = (id) => {
        setStudentToDelete(id);
        setOpenDialog(true);
    };

    const handleDelete = async () => {
        try {
            await studentApi.deleteStudent(studentToDelete);
            setStudents(students.filter(s => s.id !== studentToDelete));
            setOpenDialog(false);
            showSnackbar("Студент удален", "success");
        } catch (error) {
            console.error("Ошибка при удалении:", error);
            showSnackbar("Ошибка при удалении студента", "error");
        }
    };

    const handleNameChange = (id, newName) => {
        const newStudents = students.map(st => {
            if (st.id === id) {
                return {...st, name: newName};
            }
            return st;
        });
        setStudents(newStudents);
    };

    const handleAgeChange = (id, newAge) => {
        const newStudents = students.map(st => {
            if (st.id === id) {
                return {...st, age: newAge};
            }
            return st;
        });
        setStudents(newStudents);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const getSubjectName = (subjectId) => {
        const student = students.find(s => s.id === studentToDelete);
        return student?.subjects?.find(s => s.id === subjectId)?.name || subjectId;
    };

    return (
        <Container>
            <Header>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
                    Управление студентами
                </Typography>
            </Header>

            <ActionBar elevation={0}>
                <Typography variant="h6" sx={{ marginBottom: 2, color: "#1a237e" }}>
                    Добавить нового студента
                </Typography>

                <FormGrid container>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Имя студента"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Возраст"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: <AgeIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="group-select-label">Группа</InputLabel>
                            <TextField
                                select
                                label="Группа"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                                disabled={loadingGroups}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <GroupIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                <MenuItem value="">
                                    <em>Без группы</em>
                                </MenuItem>
                                {groups.map(group => (
                                    <MenuItem key={group.id} value={group.id}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
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
                            Добавить студента
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
                        Все студенты ({students.length})
                    </Typography>

                    {students.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "#f8f9fa" }}>
                            <Typography variant="body1" color="textSecondary">
                                Студенты отсутствуют. Добавьте первого студента выше.
                            </Typography>
                        </Paper>
                    ) : (
                        <StudentsList>
                            {students.map(student => (
                                <StudentCard key={student.id}>
                                    <CardContent>
                                        <StudentHeader>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                Студент #{student.id}
                                            </Typography>
                                            <IconButton
                                                color="error"
                                                onClick={() => confirmDelete(student.id)}
                                                size="small"
                                                disabled={updatingStudentId === student.id}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </StudentHeader>

                                        <EditContainer>
                                            <InfoItem>
                                                <PersonIcon fontSize="small" />
                                                <TextField
                                                    fullWidth
                                                    label="Имя"
                                                    value={student.name || ""}
                                                    onChange={(e) => handleNameChange(student.id, e.target.value)}
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={updatingStudentId === student.id}
                                                />
                                            </InfoItem>

                                            <InfoItem>
                                                <AgeIcon fontSize="small" />
                                                <TextField
                                                    fullWidth
                                                    label="Возраст"
                                                    type="number"
                                                    value={student.age || ""}
                                                    onChange={(e) => handleAgeChange(student.id, e.target.value)}
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={updatingStudentId === student.id}
                                                />
                                            </InfoItem>

                                            {student.group && (
                                                <InfoItem>
                                                    <GroupIcon fontSize="small" />
                                                    <TextField
                                                        fullWidth
                                                        label="Группа"
                                                        value={`${student.group.name} (ID: ${student.group.id})`}
                                                        variant="outlined"
                                                        size="small"
                                                        disabled
                                                    />
                                                </InfoItem>
                                            )}
                                        </EditContainer>

                                        <SectionTitle variant="subtitle1">
                                            <GradeIcon fontSize="small" />
                                            Оценки:
                                        </SectionTitle>
                                        <InfoBox>
                                            {student.marks?.length > 0 ? (
                                                student.marks.map(mark => (
                                                    <MarkItem key={mark.id}>
                                                        <Typography variant="body2">
                                                            {mark.value}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            ({getSubjectName(mark.subjectId)})
                                                        </Typography>
                                                    </MarkItem>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    Нет оценок
                                                </Typography>
                                            )}
                                        </InfoBox>

                                        <ButtonContainer>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={updatingStudentId === student.id ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                                onClick={() => handleUpdate(student.id)}
                                                disabled={updatingStudentId === student.id}
                                                sx={{
                                                    borderRadius: '8px',
                                                    bgcolor: '#1976d2',
                                                    '&:hover': { bgcolor: '#1565c0' },
                                                }}
                                                fullWidth
                                            >
                                                {updatingStudentId === student.id ? "Сохранение..." : "Сохранить"}
                                            </Button>
                                        </ButtonContainer>
                                    </CardContent>
                                </StudentCard>
                            ))}
                        </StudentsList>
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
                        Вы уверены, что хотите удалить этого студента?
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