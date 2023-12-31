// 필요한 모듈과 컴포넌트 import
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import axios from 'axios';
import Wrapper from '@/components/Wrapper/Wrapper';
import ProductList from '@/components/Product/ProductList';
import Pagination from '@/components/SearchInput/Pagination';
import SortButton from '@/components/SearchInput/RecommandButton';
import HighPriceSortButton from '@components/SearchInput/HighPriceSortButton';
import styles from '@components/SearchInput/SearchInput.module.css';
import LowPriceSortButton from '@/components/SearchInput/LowPriceSortButton';
import SearchNull from '@assets/images/search_null.svg';
import RecoToolTip from '@assets/images/recommandButtonToolTip.svg'

// 상품 타입을 정의
type ProductType = {
	no: number;
	name: string;
	discount_rate: number;
	sales_price: number;
	discounted_price: number;
	review_count: string;
	list_image_url: string;
	category: number;
};

// 배너 타입을 정의
export type BannerType = {
	image_url: string;
};

// 페이지 당 표시할 아이템 수를 정의
const ITEMS_PER_PAGE = 4; // Number of items to display per page

// SearchPage 컴포넌트를 정의
const SearchPage = () => {
	// 상태 변수들을 선언
	const [banners, setBanners] = useState();
	const [selectedCategory] = useState(100);
	const [categories, setCategories] = useState<ProductType[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
	const [highSortType, setHighSortType] = useState<'default' | 'highToLow'>('default');
	const [lowSortType, setLowSortType] = useState<'default' | 'lowToHigh'>('default');
	const [currentPage, setCurrentPage] = useState(1);

	// SearchInput에 있는 쿼리값을 가져옴
	const [searchParams] = useSearchParams();
	// 선택된 카테고리에 해당하는 상품을 필터링하여 가져오는 함수를 선언
	const selectedProducts = useMemo(() => {
		return categories?.filter(item => item.category === selectedCategory);
	}, [categories, selectedCategory]);

	// 컴포넌트가 마운트될 때 배너와 카테고리 데이터를 가져오는 효과를 정의
	useEffect(() => {
		axios.get(`/dbs/mainBanner.json`).then(data => {
			setBanners(data.data.products);
		});
	}, []);

	useEffect(() => {
		axios.get(`/dbs/category.json`).then(data => {
			setCategories(data.data.products);
		});
	}, []);

	// 검색어에 따라 상품을 필터링하여 보여주는 효과를 정의
	useEffect(() => {

		const sword = searchParams.get('sword');
		if (sword) {
			const filtered = selectedProducts?.filter(item =>
				item.name.toLowerCase().includes(sword.toLowerCase())
			);
			setFilteredProducts(filtered || []);
		} else {
			setFilteredProducts(selectedProducts || []);
		}
	}, [selectedProducts, searchParams]);

	// '높은가격순' 버튼 클릭 시 상품을 높은 가격순으로 정렬하는 함수를 정의
	const handleSortHighToLow = () => {
		setHighSortType('highToLow');
		setLowSortType('default'); // 다른 버튼 클릭 상태 초기화
		const sorted = [...filteredProducts].sort((a, b) => b.sales_price - a.sales_price);
		setFilteredProducts(sorted);
	};

	// '낮은가격순' 버튼 클릭 시 상품을 낮은 가격순으로 정렬하는 함수를 정의
	const handleSortLowToHigh = () => {
		setLowSortType('lowToHigh');
		setHighSortType('default'); // 다른 버튼 클릭 상태 초기화
		const sorted = [...filteredProducts].sort((a, b) => a.sales_price - b.sales_price);
		setFilteredProducts(sorted);
	};

	// 추천순으로 정렬하기
	const handleSortByReview = () => {
		const sorted = [...filteredProducts].sort(
			(a, b) => Number(b.discount_rate) - Number(a.discount_rate)
		);
		setFilteredProducts(sorted);
	};

	// 현재 페이지의 아이템을 계산
	const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const currentItems = filteredProducts.slice(startIndex, endIndex);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	if (!banners) return <></>;
	return (
		<div className={styles.container}>
			<Wrapper>

				<div className={styles.productList}>
					{searchParams.get('sword') ? (
						<div className={`${styles.resultText} ${styles.searchQueryText}`}>
							<span className={styles.searchQuery_left}>{'\''}</span>
							<span className={styles.searchQuery}>{searchParams.get('sword')}</span>
							<span className={styles.searchQuery_right}>{'\''}</span>
							<span className={styles.searchQueryDesc}>에 대한 입력결과</span>
						</div>
					) : null}

					{filteredProducts.length === 0 && searchParams.get('sword') ? (
						<><div className={styles.searchreultContainner}>
							<img src={SearchNull} alt="No_Results" className={styles.noResultsImage} />
							<div className={styles.searchReultNull}>검색된 상품이 없습니다.</div>
						</div></>
					) : (
						<>
							<div className={styles.searchsection}>
								<div className={styles.buttonBar}>
									<span className={styles.totalCount}>총
										<span className={styles.count}>{filteredProducts.length}
										</span>건
									</span>
									{/* 추천순 버튼 */}
									<SortButton
										onClick={handleSortByReview}
										className={highSortType === 'default' ? '' : styles.clickedButton} // 버튼 클릭 상태에 따라 스타일 설정
									>
										추천순
										<div className={styles.RecoToolTip}>
											<img src={RecoToolTip} alt="Reco_ToolTip" className={styles.RecoToolTip} />
											<p className={styles.TooltipText}>
												<p>검색어 적합성과 소비자 인기도(판매량,판매금액,</p>
												<p>조회수 등)을 종합적으로 고려한 순서입니다.</p>
											</p>
										</div>
									</SortButton>
									<span className={styles.separator}></span>
									{/* 높은가격순 버튼 */}
									<HighPriceSortButton
										onClick={handleSortHighToLow}
										className={highSortType === 'highToLow' ? styles.clickedButton : ''} // 버튼 클릭 상태에 따라 스타일 설정
									>
										높은가격순
									</HighPriceSortButton>
									<span className={styles.separator}></span>
									{/* 낮은가격순 버튼 */}
									<LowPriceSortButton
										onClick={handleSortLowToHigh}
										className={lowSortType === 'lowToHigh' ? styles.clickedButton : ''} // 버튼 클릭 상태에 따라 스타일 설정
									>
										낮은가격순
									</LowPriceSortButton>
								</div>
							</div>
							{<ProductList products={currentItems} />}
							<div className={styles.paginationCenter}>
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={handlePageChange}
									buttonClassName={styles.paginationButton}
									activeButtonClassName={styles.active}
								/>
							</div>
						</>
					)}

				</div>
			</Wrapper>
		</div>
	);
};

export default SearchPage;