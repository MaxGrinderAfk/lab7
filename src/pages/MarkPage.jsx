import { useEffect, useState } from "react";
import {
    TextField,
    Button,
    Paper,
    IconButton,
    Typography,
    CircularProgress,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    InputAdornment
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
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

const StyledTableContainer = styled(TableContainer)`
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    margin-top: 24px;
`;

const StyledTableCell = styled(TableCell)`
    font-weight: 500;
`;

const ValueCell = styled(TableCell)`
    font-weight: 600;
`;

const SearchContainer = styled.div`
    margin-bottom: 16px;
    display: flex;
    gap: 16px;
`;

export default function MarkPage() {
    const [marks, setMarks] = useState([]);
    const [subjects, setSubjects] = useState({});
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [students, setStudents] = useState({});
    const [studentOptions, setStudentOptions] = useState([]);
    const [studentId, setStudentId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [markToDelete, setMarkToDelete] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [searching, setSearching] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const fetchSubjects = async () => {
        try {
            const res = await subjectApi.getSubjects();
            const subjectsMap = {};
            const options = [];

            res.data.forEach(subject => {
                subjectsMap[String(subject.id)] = subject.name || `Предмет #${subject.id}`;
                options.push({
                    id: subject.id,
                    name: subject.name || `Предмет #${subject.id}`
                });
            });

            setSubjects(subjectsMap);
            setSubjectOptions(options);
            return subjectsMap;
        } catch (error) {
            showSnackbar("Ошибка при загрузке предметов", "error");
            return {};
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await studentApi.getStudents(); // Убедитесь, что этот метод существует
            const studentsMap = {};
            const options = [];

            res.data.forEach(student => {
                studentsMap[String(student.id)] = student.name || `Студент #${student.id}`;
                options.push({
                    id: student.id,
                    name: student.name || `Студент #${student.id}`
                });
            });

            setStudents(studentsMap);
            setStudentOptions(options);
            return studentsMap;
        } catch (error) {
            showSnackbar("Ошибка при загрузке студентов", "error");
            return {};
        }
    };

    const fetchMarks = async (subjectsData, studentsData) => {
        try {
            const res = await markApi.getMarks();
            const marksData = Array.from(res.data);
            const studentPromises = [];
            const subjectPromises = [];

            for (const mark of marksData) {
                if (mark.subjectId !== undefined && mark.subjectId !== null) {
                    const subjectIdStr = String(mark.subjectId);
                    if (!subjectsData[subjectIdStr]) {
                        subjectPromises.push(
                            markApi.getSubject(mark.subjectId)
                                .then(subjectRes => {
                                    if (subjectRes && subjectRes.data) {
                                        subjectsData[subjectIdStr] = subjectRes.data.name || `Предмет #${mark.subjectId}`;
                                    } else {
                                        subjectsData[subjectIdStr] = `Предмет #${mark.subjectId}`;
                                    }
                                })
                                .catch(() => {
                                    subjectsData[subjectIdStr] = `Предмет #${mark.subjectId}`;
                                })
                        );
                    }
                }

                if (mark.studentId !== undefined && mark.studentId !== null) {
                    const studentIdStr = String(mark.studentId);
                    if (!studentsData[studentIdStr]) {
                        studentPromises.push(
                            markApi.getStudent(mark.studentId)
                                .then(studentRes => {
                                    if (studentRes && studentRes.data) {
                                        studentsData[studentIdStr] = studentRes.data.name || `Студент #${mark.studentId}`;
                                    } else {
                                        studentsData[studentIdStr] = `Студент #${mark.studentId}`;
                                    }
                                })
                                .catch(() => {
                                    studentsData[studentIdStr] = `Студент #${mark.studentId}`;
                                })
                        );
                    }
                }
            }

            await Promise.all([...subjectPromises, ...studentPromises]);

            setSubjects({...subjectsData});
            setStudents({...studentsData});

            const studentOpts = Object.entries(studentsData).map(([id, name]) => ({
                id,
                name
            }));
            setStudentOptions(studentOpts);

            setMarks(marksData);
            return marksData;
        } catch (error) {
            showSnackbar("Ошибка при загрузке оценок", "error");
            return [];
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const subjectsData = await fetchSubjects();
                const studentsData = await fetchStudents();
                await fetchMarks(subjectsData, studentsData);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearchStudent = async () => {
        if (!searchName.trim()) {
            showSnackbar("Введите имя студента для поиска", "warning");
            return;
        }

        setSearching(true);
        try {
            const response = await markApi.getStudentByName(searchName);
            const student = response.data; // Предполагаем, что возвращается объект студента

            // Обновляем список студентов
            setStudents(prev => ({
                ...prev,
                [student.id]: student.name
            }));

            setStudentOptions(prev => [
                ...prev,
                { id: student.id, name: student.name }
            ]);

            setStudentId(student.id);
            showSnackbar(`Студент найден: ${student.name}`, "success");
        } catch (error) {
            // ... обработка ошибок
        } finally {
            setSearching(false);
        }
    }

    const handleAdd = async () => {
        if (!studentId || !subjectId || !value) {
            showSnackbar("Заполните все поля", "warning");
            return;
        }

        try {
            const parsedStudentId = parseInt(studentId);
            const parsedSubjectId = parseInt(subjectId);
            const parsedValue = parseInt(value);

            await markApi.createMark({
                studentId: parsedStudentId,
                subjectId: parsedSubjectId,
                value: parsedValue
            });

            const subjectsData = {...subjects};
            const studentsData = {...students};

            const subjectIdStr = String(parsedSubjectId);
            const studentIdStr = String(parsedStudentId);

            if (!subjectsData[subjectIdStr]) {
                try {
                    const subjectData = await markApi.getSubject(parsedSubjectId);
                    if (subjectData && subjectData.data) {
                        subjectsData[subjectIdStr] = subjectData.data.name || `Предмет #${parsedSubjectId}`;
                    } else {
                        subjectsData[subjectIdStr] = `Предмет #${parsedSubjectId}`;
                    }
                    setSubjects({...subjectsData});
                } catch (error) {
                    subjectsData[subjectIdStr] = `Предмет #${parsedSubjectId}`;
                }
                setSubjects({...subjectsData});
            }

            if (!studentsData[studentIdStr]) {
                try {
                    const studentData = await markApi.getStudent(parsedStudentId);
                    if (studentData && studentData.data) {
                        studentsData[studentIdStr] = studentData.data.name || `Студент #${parsedStudentId}`;
                    } else {
                        studentsData[studentIdStr] = `Студент #${parsedStudentId}`;
                    }
                } catch (error) {
                    studentsData[studentIdStr] = `Студент #${parsedStudentId}`;
                }
                setStudents({...studentsData});
            }

            await fetchMarks(subjectsData, studentsData);
            setStudentId("");
            setSubjectId("");
            setValue("");
            showSnackbar("Оценка успешно добавлена", "success");
        } catch (error) {
            showSnackbar("Ошибка при добавлении оценки", "error");
        }
    }

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
        if (value >= 90) return "success.main";
        if (value >= 70) return "primary.main";
        if (value >= 50) return "warning.main";
        return "error.main";
    };

    const getSubjectName = (subjectId) => {
        if (subjectId === undefined || subjectId === null) {
            return "Предмет не указан";
        }
        const subjectIdStr = String(subjectId);
        return subjects[subjectIdStr] || `Предмет #${subjectId}`;
    };

    const getStudentName = (studentId) => {
        if (studentId === undefined || studentId === null) {
            return "Студент не указан";
        }
        const studentIdStr = String(studentId);
        return students[studentIdStr] || `Студент #${studentId}`;
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

                <SearchContainer>
                    <TextField
                        fullWidth
                        label="Поиск студента по имени"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleSearchStudent}
                                        edge="end"
                                        disabled={searching}
                                    >
                                        {searching ? <CircularProgress size={20} /> : <SearchIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchStudent();
                            }
                        }}
                    />
                </SearchContainer>

                <FormGrid container>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Студент"
                            select
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            variant="outlined"
                            size="small"
                        >
                            <MenuItem value="">
                                <em>Выберите студента</em>
                            </MenuItem>
                            {studentOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Предмет"
                            select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            variant="outlined"
                            size="small"
                        >
                            <MenuItem value="">
                                <em>Выберите предмет</em>
                            </MenuItem>
                            {subjectOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
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
                        <StyledTableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                        <StyledTableCell>Номер</StyledTableCell>
                                        <StyledTableCell>Студент</StyledTableCell>
                                        <StyledTableCell>Предмет</StyledTableCell>
                                        <StyledTableCell align="center">Оценка</StyledTableCell>
                                        <StyledTableCell align="right">Действия</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {marks.map((mark) => (
                                        <TableRow key={mark.id} hover>
                                            <TableCell>{mark.id}</TableCell>
                                            <TableCell>{getStudentName(mark.studentId)}</TableCell>
                                            <TableCell>{getSubjectName(mark.subjectId)}</TableCell>
                                            <ValueCell align="center" sx={{ color: getMarkColor(mark.value) }}>
                                                {mark.value}
                                            </ValueCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => confirmDelete(mark.id)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </StyledTableContainer>
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