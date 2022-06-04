import { SearchOutlined } from '@mui/icons-material';

import styles from './Search.module.css';

interface SearchProps {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

export const Search = ({ handleChange }: SearchProps) => {
    return (
        <div className={styles.container}>
            <SearchOutlined />
            <input type='search' className={styles.searchInput} onChange={(e) => handleChange(e)} />
        </div>
    );
}
