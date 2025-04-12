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
    Alert
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Book as BookIcon
} from "@mui/icons-material";
import styled from "@emotion/styled";
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

const SubjectsList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-top: 24px;
`;

const SubjectCard = styled(Card)`
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    }
`;

export default function SubjectPage() {
    const [subjects, setSubjects] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await subjectApi.getSubjects();
            setSubjects(res.data);
        } catch (error) {
            showSnackbar("Ошибка при загрузке предметов", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleAdd = async () => {
        if (!name.trim()) {
            showSnackbar("Введите название предмета", "warning");
            return;
        }

        try {
            const newSubject = { name };
            const res = await subjectApi.createSubject(newSubject);

            setSubjects((prev) => [...prev, res.data]);
            setName("");
            showSnackbar("Предмет успешно добавлен", "success");
        } catch (error) {
            showSnackbar("Ошибка при добавлении предмета", "error");
        }
    };

    const confirmDelete = (id) => {
        setSubjectToDelete(id);
        setOpenDialog(true);
    };

    const handleDelete = async () => {
        try {
            await subjectApi.deleteSubject(subjectToDelete);
            setSubjects((prev) => prev.filter((s) => s.id !== subjectToDelete));
            setOpenDialog(false);
            showSnackbar("Предмет удален", "success");
        } catch (error) {
            showSnackbar("Ошибка при удалении предмета", "error");
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Container>
            <Header>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
                    Управление предметами
                </Typography>
            </Header>

            <ActionBar elevation={0}>
                <Typography variant="h6" sx={{ marginBottom: 2, color: "#1a237e" }}>
                    Добавить новый предмет
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth
                            label="Название предмета"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: <BookIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdd}
                            fullWidth
                            sx={{
                                bgcolor: "#1a237e",
                                "&:hover": { bgcolor: "#303f9f" },
                                borderRadius: "8px",
                                height: "40px"
                            }}
                        >
                            Добавить предмет
                        </Button>
                    </Grid>
                </Grid>
            </ActionBar>

            {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <CircularProgress size={60} thickness={4} sx={{ color: "#1a237e" }} />
                </div>
            ) : (
                <>
                    <Typography variant="h6" sx={{ marginBottom: 2, color: "#555" }}>
                        Все предметы ({subjects.length})
                    </Typography>

                    {subjects.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                textAlign: "center",
                                borderRadius: 3,
                                bgcolor: "#f8f9fa"
                            }}
                        >
                            <Typography variant="body1" color="textSecondary">
                                Предметы отсутствуют. Добавьте первый предмет выше.
                            </Typography>
                        </Paper>
                    ) : (
                        <SubjectsList>
                            {subjects.map((subject) => (
                                <SubjectCard key={subject.id}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                            Предмет #{subject.id}: {subject.name}
                                        </Typography>
                                        <IconButton
                                            color="error"
                                            onClick={() => confirmDelete(subject.id)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardContent>
                                </SubjectCard>
                            ))}
                        </SubjectsList>
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
                        Вы уверены, что хотите удалить этот предмет?
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
