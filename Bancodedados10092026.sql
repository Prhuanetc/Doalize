-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: doalize
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_one_id` int(11) NOT NULL,
  `user_two_id` int(11) NOT NULL,
  `last_message` text DEFAULT NULL,
  `last_message_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_one_id` (`user_one_id`),
  KEY `user_two_id` (`user_two_id`),
  CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`user_one_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`user_two_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chats`
--

LOCK TABLES `chats` WRITE;
/*!40000 ALTER TABLE `chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `audio` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,3,1,'Oi',NULL,NULL,'2026-05-26 14:10:55'),(2,3,2,'Ola',NULL,NULL,'2026-05-26 14:13:43'),(3,3,1,'Gallo melhor professor',NULL,NULL,'2026-05-26 14:22:18'),(4,3,3,'Ola',NULL,NULL,'2026-06-16 13:19:11'),(5,3,3,'Anotacoes',NULL,NULL,'2026-08-14 14:23:44'),(6,5,3,'Eu conheco um bom limpador de piscina, quer o numero?',NULL,NULL,'2026-08-26 16:57:38'),(7,5,3,'teste',NULL,NULL,'2026-08-26 17:17:06'),(8,5,3,'ola',NULL,NULL,'2026-08-26 17:17:18'),(9,5,3,'testando',NULL,NULL,'2026-08-26 17:17:24'),(10,5,3,'ola',NULL,NULL,'2026-08-26 17:18:05'),(11,4,5,'No ceu tem pao',NULL,NULL,'2026-09-10 13:42:08'),(12,4,5,'Me da dinheiro',NULL,NULL,'2026-09-10 13:42:14'),(15,6,5,'Ou',NULL,NULL,'2026-09-10 14:20:28'),(16,6,5,'Bobao',NULL,NULL,'2026-09-10 14:20:34');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_verifications`
--

DROP TABLE IF EXISTS `password_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `password_verifications_user_id_index` (`user_id`),
  KEY `password_verifications_user_used_index` (`user_id`,`used`),
  KEY `password_verifications_created_at_index` (`created_at`),
  CONSTRAINT `password_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_verifications`
--

LOCK TABLES `password_verifications` WRITE;
/*!40000 ALTER TABLE `password_verifications` DISABLE KEYS */;
INSERT INTO `password_verifications` VALUES (6,5,'$2b$10$Iv9xL5zM3zovGRJ.qNc/M.NX.sQDeOsAdX5EYua6RD.DyJ5iasnwO','2026-08-26 17:08:30',0,1,'2026-08-26 16:58:30'),(7,3,'$2b$10$PtI67H93FNew0cdh.g1YF.FVGj2wT9LmiXIKie2pjKXMoKQQVoGHK','2026-09-10 13:45:46',0,1,'2026-09-10 13:35:46'),(8,6,'$2b$10$qy3u8U.hY0fGTJt3EF29QOJJPlWG2mBAbJ9Dl2A5xdQ2G.iSa5o8u','2026-09-10 14:34:05',0,1,'2026-09-10 14:24:05');
/*!40000 ALTER TABLE `password_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_promotions`
--

DROP TABLE IF EXISTS `post_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_promotions_post_user_unique` (`post_id`,`user_id`),
  KEY `post_promotions_post_id_index` (`post_id`),
  KEY `post_promotions_user_id_index` (`user_id`),
  CONSTRAINT `post_promotions_ibfk_29` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_promotions_ibfk_30` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_promotions`
--

LOCK TABLES `post_promotions` WRITE;
/*!40000 ALTER TABLE `post_promotions` DISABLE KEYS */;
INSERT INTO `post_promotions` VALUES (1,9,5,'2026-08-26 17:21:38'),(2,8,5,'2026-08-26 17:21:48'),(3,9,4,'2026-08-26 17:25:43');
/*!40000 ALTER TABLE `post_promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `promoted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `summary` varchar(160) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,3,'Ola, preciso de alimentos, roupas, medicamentos, basicamente qualquer coisa','[]',0,'2026-05-26 14:38:34',NULL),(2,3,'Preciso de doacoes para melhorar minha casinha linda','[\"file:///data/user/0/host.exp.exponent/cache/ImagePicker/e2235f5a-7855-4784-a141-23aeee05f879.jpeg\"]',1,'2026-06-10 13:39:43',NULL),(3,3,'Me ajude, sou analfabeto e pobre','[\"file:///data/user/0/host.exp.exponent/cache/ImagePicker/fac20d79-9550-4102-9181-2b0a1e1a2e7a.jpeg\"]',0,'2026-06-16 13:53:59',NULL),(4,3,'Esta e minha casa e queria uma casa sem goteiras e onde nao passe frio','[\"file:///data/user/0/host.exp.exponent/cache/ImagePicker/130a141f-bb72-4ffc-98b0-1420baf051b5.jpeg\"]',1,'2026-06-16 14:10:46',NULL),(5,3,'Tenho piscina em casa e preciso de alguem para limpar','[\"/uploads/posts/1786717386156-b12bab136021112eea5460396fea2994.jpeg\"]',0,'2026-08-14 14:23:06',NULL),(6,3,'Preciso de alimento','[\"/uploads/posts/1787235740424-cff3cc8e529cd1fc0190721967488c27.jpeg\",\"/uploads/posts/1787235741249-d8fda8fccd9a9dac43c2c46cd6fc02b0.jpeg\"]',0,'2026-08-20 14:22:21',NULL),(7,3,'Tenho 73 anos, fui alcolatra, e sou acumulador, nao consigo trabalhar pois tenho problema na coluna','[\"/uploads/posts/1787238341624-c86581b0b56d132ed9604119956865e3.jpg\"]',0,'2026-08-20 15:05:42','Preciso de ajuda'),(8,3,'TestandoTestandoTestandoTestandoTestandoTestandoTestandoTestando','[\"/uploads/posts/1787238388794-7263a0de452527adf9bc38a9741e7a46.jpg\",\"/uploads/posts/1787238389352-e50e034a1777fa2f3722d88e444f54ee.jpg\",\"/uploads/posts/1787238390187-4f4cdec063992c19c0a037d4002353cd.jpg\"]',1,'2026-08-20 15:06:30','Testando'),(9,5,'Olhem minha nova ferrari, estou completamente bravo pq na loja nao tinha na cor preta, somente na cor vermelha, que vergonha de pais','[\"/uploads/posts/1787763141917-f80392271617fdfc24a8c9f6a674c5f5.jpg\",\"/uploads/posts/1787763142679-b1d01baaef1a1360396e067a04fd3360.jpg\",\"/uploads/posts/1787763143728-5d4b3a9ee437f73502fb18a3073bace8.jpg\"]',1,'2026-08-26 16:52:24','Compra nova'),(11,4,'Minha prima vende batatas recheadas em Igaracu do tiete. Interessados entrar em contato','[\"/uploads/posts/1789047697840-55cd0090a043b6bf973433632e2c6a65.jpg\"]',0,'2026-09-10 13:41:38','Vende-se batatas recheadas'),(12,6,'Arroz e batata','[\"/uploads/posts/1789050061799-1c662d330b741f79daa985b3295a33e2.jpg\"]',0,'2026-09-10 14:21:02','Quero doar comida');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password` varchar(255) NOT NULL,
  `photo` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(160) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `terms_accepted_at` datetime DEFAULT NULL,
  `terms_version` varchar(30) DEFAULT NULL,
  `privacy_version` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  UNIQUE KEY `users_email_index` (`email`),
  KEY `users_terms_version_index` (`terms_version`),
  KEY `users_privacy_version_index` (`privacy_version`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Etec','etec@gmail.com','$2b$10$Rw6q0NB1hYyNra0RNOXxd.3D1AsdcM0zK7EVgM4KjEvWXzcPGbYyC',NULL,NULL,NULL,'2026-05-19 14:00:26',NULL,NULL,NULL),(2,'Lucas ','lucasjr@gmail.com','$2b$10$pmTM7NOEALJ7GWNWMN4WG.SxeCGJAp1yEr0sIMwj96jXiaZkeI1bW',NULL,NULL,NULL,'2026-05-19 14:12:47',NULL,NULL,NULL),(3,'anthony rodrigues da silva','anthonyserrano894@gmail.com','$2b$10$m5M0wGgFrUFjlf9ri0KgKes/EzwLr.t8GjcJQK91F1n9VB5xqsvk6','/uploads/users/1786717331270-b6cc1e968fed202a65502ca213256b57.jpeg','Tenho 18 anos e estou no ensino medio','Barra Bonita sp','2026-05-20 14:30:06',NULL,NULL,NULL),(4,'Usuário removido','conta-removida-4-d49b185656c173e4929bda13@doalize.invalid','$2b$12$k0uzl4loZk9Z1/LM12JdQuu9egiFj4Zyr1V2hMsTYraq0ojbP/ele',NULL,NULL,NULL,'2026-08-26 16:40:01',NULL,NULL,NULL),(5,'Rhuan P','roii265p@gmail.com','$2b$10$k6015JXTVpI6mEjkztg53e5fHzhUlRmHtWssimB1gaWnWI2O09UeS','/uploads/users/1787762906273-9796a4af097ecbda2eb18ff5ffad0588.jpeg','Dev app','Barra Bonita','2026-08-26 16:42:31',NULL,NULL,NULL),(6,'Koala sem pai','pedrogrigolato23@gmail.com','$2b$10$O4LedZp59bAuoCGRg3dGbuaiMOZdwbTwH2NOHdkGjuM9jcT89cqTW','/uploads/users/1789050233999-66a1bb2c37ae31c2cc009e1a680669a7.jpeg','Eu sou lindo e estou testando o site dos cara','cadeiropolis','2026-09-10 14:19:22','2026-09-10 14:19:22','1.0','1.0');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-10 12:23:31
