import * as React from 'react';

import styles from '@components/SearchInput/SearchInput.module.css';

type HighPriceSortButtonProps = {
	onClick: () => void;
	children: React.ReactNode;
	className?: string; // className 속성 추가
};

const HighPriceSortButton: React.FC<HighPriceSortButtonProps> = ({ onClick, children }) => {
	return (
		<button className={styles.highPriceButton} onClick={onClick}>
			{children}
		</button>
	);
};

export default HighPriceSortButton;
