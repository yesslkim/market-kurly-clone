import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';

import Wrapper from '@/components/Wrapper/Wrapper';
import MainSwiper from '@/components/MainSwiper/MainSwiper';

import ProductList from '@/components/Product/ProductList';
import Promotion from '@/components/Product/Promotion';
import Banner from '@/components/Product/Banner';
import Category from '@/components/Product/Category';
import useModals from '@/hooks/useModals';
import HomeModal from '@/components/Modal/HomeModal';

export type Product = {
	no: number;
	name: string;
	discount_rate: number;
	sales_price: number;
	discounted_price: number;
	review_count: string;
	list_image_url: string;
	category: number;
};

export type BannerType = {
	image_url: string;
};

const MainPage = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [promotions, setPromotions] = useState<Product[]>([]);
	const [banners, setBanners] = useState();
	const [selectedCategory, setSelectedCategory] = useState(100);
	const [categories, setCategories] = useState<Product[]>([]);

	const isFirstLoaded = useRef(false);

	const selectedProducts = useMemo(() => {
		return categories?.filter(item => item.category === selectedCategory);
	}, [categories, selectedCategory]);

	useEffect(() => {
		axios.get(`/dbs/todayRecommend.json`).then(data => {
			setProducts(data.data.products);
		});
	}, []);

	useEffect(() => {
		axios.get(`/dbs/specialDeal.json`).then(data => {
			setPromotions(data.data.products);
		});
	}, []);

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

	const { openModal } = useModals();

	useEffect(() => {
		if (!isFirstLoaded.current) {
			isFirstLoaded.current = true;
			openModal(HomeModal, {});
		}
	}, [openModal, isFirstLoaded]);

	if (!banners) return <></>;
	return (
		<div>
			<MainSwiper />
			<Wrapper>
				{/* 오늘의 추천 상품 */}
				<ProductList title={'오늘의 추천 상품'} products={products} navigation />

				{/* 프로모션 상품 */}
				<Promotion promotions={promotions} />

				{/* 배너 */}
				<Banner banner={banners[0]} />

				{/* 카테고리별 상품 */}
				<Category selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

				<ProductList products={selectedProducts} navigation />

				{/* 배너2 */}
				<Banner banner={banners[3]} />

				<ProductList title={'이 상품 어때요?'} products={products} autoPlay navigation />

				{/* 이 상품 어때요? */}
			</Wrapper>
		</div>
	);
};

export default MainPage;
