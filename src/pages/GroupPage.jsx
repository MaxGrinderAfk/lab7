import { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Chip,
    CircularProgress,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import {
    Add,
    Close,
    Delete,
    Visibility,
    FilterList,
    Sort,
    CheckCircle
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import * as groupApi from "../services/groupService";
import styled from "@emotion/styled";

const Container = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 24px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
`;

const ActionBar = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
    background: #f8f9fa;
    padding: 16px;
    border-radius: 12px;
`;

function GroupDetailsDialog({ open, group, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: '#1a237e',
                color: 'white'
            }}>
                {group?.name}
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
                <div style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#666'
                }}>
                    Информация о группе
                    <div style={{ marginTop: 16, fontWeight: 'bold' }}>
                        ID группы: {group?.id}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function GroupPage() {
    const { control, handleSubmit, reset } = useForm();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadGroups = async () => {
            try {
                const response = await groupApi.getGroups();
                setGroups(response.data);
            } catch (error) {
                showError('Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };
        loadGroups();
    }, []);

    const handleCreateGroup = async (data) => {
        try {
            let studentIds = [];
            if (data.students && data.students.trim()) {
                studentIds = data.students
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s !== '')
                    .map(id => parseInt(id, 10));
            }

            const requestPayload = {
                name: data.name,
                studentIds: studentIds
            };

            const response = await groupApi.createGroup(requestPayload);
            setGroups(prev => [...prev, response.data]);
            setOpenDialog(false);
            reset();
            setSnackbar({ open: true, message: 'Группа успешно создана' });
        } catch (error) {
            console.error("Ошибка создания группы:", error);
            showError(error.response?.data?.message || 'Ошибка создания группы');
        }
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            await groupApi.deleteGroup(groupId);
            setGroups(prev => prev.filter(g => g.id !== groupId));
            setSnackbar({ open: true, message: 'Группа удалена' });
        } catch (error) {
            showError('Ошибка удаления группы');
        }
    };

    const handleViewGroup = async (groupId) => {
        try {
            const response = await groupApi.getGroupById(groupId);
            setSelectedGroup(response.data);
        } catch (error) {
            showError('Ошибка получения данных группы');
        }
    };

    const showError = (message) => {
        setSnackbar({ open: true, message });
    };

    return (
        <Container>
            <Header>
                <h1 style={{ margin: 0, fontSize: '32px', color: '#1a237e' }}>Управление группами</h1>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        bgcolor: '#1a237e',
                        '&:hover': { bgcolor: '#303f9f' },
                        borderRadius: '8px',
                        py: 1.5,
                        px: 3
                    }}
                >
                    Новая группа
                </Button>
            </Header>

            <ActionBar>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Поиск групп..."
                    InputProps={{
                        startAdornment: <FilterList color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{ flex: 1 }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </ActionBar>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <CircularProgress size={60} thickness={4} />
                </div>
            ) : (
                <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', borderRadius: '12px' }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Название группы</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Статус</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1a237e' }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups
                                .filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((group) => (
                                    <TableRow
                                        key={group.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={group.status || 'Активна'}
                                                size="small"
                                                color={group.status === 'Архив' ? 'default' : 'success'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleViewGroup(group.id)}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDeleteGroup(group.id)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {groups.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 3 }}>
                                        Группы не найдены
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Создание новой группы
                    <IconButton onClick={() => setOpenDialog(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleSubmit(handleCreateGroup)}>
                    <DialogContent sx={{ py: 3 }}>
                        <Controller
                            name="name"
                            control={control}
                            defaultValue=""
                            rules={{ required: "Название обязательно" }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Название группы"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    required
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />

                        <Controller
                            name="students"
                            control={control}
                            defaultValue=""
                            rules={{
                                pattern: {
                                    value: /^[0-9,\s]*$/,
                                    message: "Разрешены только числа и запятые"
                                }
                            }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="ID студентов"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    helperText={fieldState.error?.message || "Введите ID через запятую"}
                                    error={!!fieldState.error}
                                    placeholder="Пример: 123, 456, 789"
                                />
                            )}
                        />
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<CheckCircle />}
                            sx={{ borderRadius: '8px', px: 3 }}
                        >
                            Создать группу
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <GroupDetailsDialog
                open={!!selectedGroup}
                group={selectedGroup}
                onClose={() => setSelectedGroup(null)}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={() => setSnackbar(s => ({ ...s, open: false }))}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                }
            />
        </Container>
    );
}