import React, { useState } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { host } from '../../components';

library.add(fas);

const AddLessonForm = ({ chapter, onAddLesson }) => {
	const [visibleForm, setFormVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const toggleFormVisible = () => {
		setFormVisible(!visibleForm);
		setInputValue('');
	};

	const addLesson = () => {
		const newLesson = {
			chapterId: chapter.id,
			title: inputValue.capitalize(),
			text: '',
			completed: false
		};
		setIsLoading(true);
		axios.post(`http://${ host.ip }:${ host.port }/lessons`, newLesson).then(({ data }) => {
			onAddLesson(chapter.id, data);
			toggleFormVisible();
		}).then(() => {
			console.debug(`Задача '${ inputValue }' успешно добавлена`);
		}).catch(error => {
			console.error('Ошибка при добавлении задачи');
			console.error(`Ошибка: ${ error }`);
			alert('Ошибка при добавлении задачи');
		}).finally(() => {
			setIsLoading(false);
		});
	};

	return (
		<div className='lessons__form'>
			{ !visibleForm ? (
				<div className='lessons__form-new' onClick={ toggleFormVisible }>
					<FontAwesomeIcon className='icon'
					                 icon={ 'plus' }/>
					<span>Новая задача</span>
				</div>
			) : (
				<div className='lessons__form-block'>
					<input className='field'
					       type='text' autoFocus
					       placeholder='Текст задачи'
					       value={ inputValue }
					       onChange={ e => setInputValue(e.target.value) }/>
					<button disabled={ isLoading } onClick={ addLesson } className='button'>
						{ isLoading ? 'Добавление...' : 'Добавить задачу' }
					</button>
					<button className='button button--grey' onClick={ toggleFormVisible }>
						Отмена
					</button>
				</div>
			) }
		</div>
	);
};

export default AddLessonForm;
