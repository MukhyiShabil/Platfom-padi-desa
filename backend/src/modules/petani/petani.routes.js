const express = require('express');
const router = express.Router();
const petaniController = require('./petani.controller');

router.get('/', petaniController.getAllPetani);
router.get('/:id', petaniController.getPetaniById);
router.post('/', petaniController.createPetani);
router.put('/:id', petaniController.updatePetani);
router.delete('/:id', petaniController.deletePetani);

module.exports = router;
