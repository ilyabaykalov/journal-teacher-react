import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { Badge, Chapter, host } from '../../components';

import './AddСhapterButton.scss';

library.add(fas);

const AddChapterButton = ({ colors, onAdd }) => {
	const [visiblePopup, setVisiblePopup] = useState(false);
	const [selectedColor, selectColor] = useState(3);
	const [isLoading, setIsLoading] = useState(false);
	const [inputValue, setInputValue] = useState('');

	useEffect(() => {
		if (Array.isArray(colors)) {
			selectColor(colors[0].id);
		}
	}, [colors]);

	const onClose = () => {
		setVisiblePopup(false);
		setInputValue('');
		selectColor(colors[0].id);
	};

	const addChapter = () => {
		if (!inputValue) {
			alert('Введите название списка');
			return;
		}

		setIsLoading(true);

		axios.post(`http://${ host.ip }:${ host.port }/chapters`, {
			name: inputValue.capitalize(),
			colorId: selectedColor
		}).then(({ data }) => {
			const color = colors.filter(c => c.id === selectedColor)[0];
			const chapterObj = { ...data, color, lessons: [] };
			onAdd(chapterObj);
			onClose();
		}).then(() => {
			console.debug(`Список задач '${ inputValue }' успешно добавлен`);
		}).catch(error => {
			console.error('Ошибка при добавлении списка');
			console.error(`Ошибка: ${ error }`);
			alert('Ошибка при добавлении списка');
		}).finally(() => {
			setIsLoading(false);
		});
	};

	return (
		<div className='add-chapter'>
			<Chapter onClick={ () => setVisiblePopup(true) }
			         items={ [{
				         className: 'add-chapter__button',
				         icon: 'plus',
				         name: 'Добавить список'
			         }] }/>
			{ visiblePopup && (
				<div className='add-chapter__popup'>
					<FontAwesomeIcon className={ 'add-chapter__popup__close-button' }
					                 icon={ 'times-circle' }
					                 onClick={ onClose }/>
					<input className='field'
					       type='text' autoFocus
					       placeholder='Название списка'
					       value={ inputValue }
					       onChange={ e => setInputValue(e.target.value) }/>
					<div className='add-chapter__popup__colors'>
						{ colors.map(color => (
							<Badge key={ color.id }
							       className={ selectedColor === color.id && 'active' }
							       onClick={ () => selectColor(color.id) }
							       color={ color.name }/>
						)) }
					</div>
					<button onClick={ addChapter } className='button'>
						{ isLoading ? 'Добавление...' : 'Добавить' }
					</button>
				</div>
			) }
		</div>
	);
};

export default AddChapterButton;
