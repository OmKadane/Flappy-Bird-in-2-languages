import pygame, sys, random, math
import os

# Function to resolve paths for bundled assets (PyInstaller compatibility)
def resource_path(relative_path):
    """Get the absolute path to a resource, works for dev and PyInstaller."""
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    else:
        return os.path.join(os.path.abspath(os.path.dirname(__file__)), relative_path)

# Initialize Game
pygame.init()

game_state = 1
score = 0
has_moved = False
color_cycle = 0
game_over = False

# Window Setup
window_w = 400
window_h = 600

screen = pygame.display.set_mode((window_w, window_h))
pygame.display.set_caption("Flappython")
clock = pygame.time.Clock()
fps = 60

# Load Fonts
font = pygame.font.Font(resource_path("Python/fonts/BaiJamjuree-Bold.ttf"), 80)
title_font = pygame.font.Font(resource_path("Python/fonts/BaiJamjuree-Bold.ttf"), 45)
subtitle_font = pygame.font.Font(resource_path("Python/fonts/BaiJamjuree-Bold.ttf"), 25)
game_over_font = pygame.font.Font(resource_path("Python/fonts/BaiJamjuree-Bold.ttf"), 50)

# Load Sounds
slap_sfx = pygame.mixer.Sound(resource_path("Python/sounds/slap.wav"))
woosh_sfx = pygame.mixer.Sound(resource_path("Python/sounds/woosh.wav"))
score_sfx = pygame.mixer.Sound(resource_path("Python/sounds/score.wav"))

# Load Images
player_img = pygame.image.load(resource_path("Python/images/player.png"))
pipe_up_img = pygame.image.load(resource_path("Python/images/pipe_up.png"))
pipe_down_img = pygame.image.load(resource_path("Python/images/pipe_down.png"))
ground_img = pygame.image.load(resource_path("Python/images/ground.png"))

bg_img = pygame.image.load(resource_path("Python/images/background.png"))
bg_width = bg_img.get_width()

# Variable Setup
bg_scroll_spd = 1
ground_scroll_spd = 2

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.velocity = 0
        self.rotation = 0

    def jump(self):
        self.velocity = -10
        self.rotation = 30

    def update(self):
        self.velocity += 0.75
        self.y += self.velocity
        if self.velocity < 0:
            self.rotation = 30
        else:
            self.rotation = max(-90, self.rotation - 3)

    def draw(self):
        rotated_player = pygame.transform.rotate(player_img, self.rotation)
        new_rect = rotated_player.get_rect(center=(self.x + player_img.get_width()/2, self.y + player_img.get_height()/2))
        screen.blit(rotated_player, new_rect.topleft)

class Pipe:
    def __init__(self, x, height, gap, velocity):
        self.x = x
        self.height = height
        self.gap = gap
        self.velocity = velocity
        self.scored = False

    def update(self):
        self.x -= self.velocity

    def draw(self):
        screen.blit(pipe_down_img, (self.x, 0 - pipe_down_img.get_height() + self.height))
        screen.blit(pipe_up_img, (self.x, self.height + self.gap))

def scoreboard():
    global color_cycle
    if has_moved:
        if not game_over:
            show_score = font.render(str(score), True, (10, 40, 9))
            score_rect = show_score.get_rect(center=(window_w//2, 64))
            screen.blit(show_score, score_rect)
        if game_over:
            color_cycle = (color_cycle + 1) % 360
            r = int(255 * abs(math.sin(math.radians(color_cycle))))
            g = int(255 * abs(math.sin(math.radians(color_cycle + 120))))
            b = int(255 * abs(math.sin(math.radians(color_cycle + 240))))
            game_over_text = game_over_font.render("Game Over !", True, (r, g, b))
            game_over_rect = game_over_text.get_rect(center=(window_w//2, window_h//2 - 30))
            screen.blit(game_over_text, game_over_rect)
            restart_text = subtitle_font.render("Press SPACE or Click to Restart", True, (10, 40, 9))
            restart_rect = restart_text.get_rect(center=(window_w//2, window_h//2 + 30))
            screen.blit(restart_text, restart_rect)
    else:
        color_cycle = (color_cycle + 1) % 360
        r = int(255 * abs(math.sin(math.radians(color_cycle))))
        g = int(255 * abs(math.sin(math.radians(color_cycle + 120))))
        b = int(255 * abs(math.sin(math.radians(color_cycle + 240))))
        title_text = title_font.render("Flappy Python", True, (r, g, b))
        title_rect = title_text.get_rect(center=(window_w//2, 50))
        screen.blit(title_text, title_rect)
        subtitle_text = subtitle_font.render("Press SPACE or Click to Start", True, (10, 40, 9))
        subtitle_rect = subtitle_text.get_rect(center=(window_w//2, 100))
        screen.blit(subtitle_text, subtitle_rect)

def game():
    global game_state
    global score
    global has_moved
    global game_over

    bg_x_pos = 0
    ground_x_pos = 0

    player = Player(168, 300)
    pipes = [Pipe(600, random.randint(30, 250), 220, 2.4)]

    while game_state != 0:
        while game_state == 1:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE:
                        if game_over:
                            player = Player(168, 300)
                            pipes = [Pipe(600, random.randint(30, 250), 220, 2.4)]
                            score = 0
                            has_moved = False
                            game_over = False
                        else:
                            has_moved = True
                            pygame.mixer.Sound.play(woosh_sfx)
                            player.jump()
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    if game_over:
                        player = Player(168, 300)
                        pipes = [Pipe(600, random.randint(30, 250), 220, 2.4)]
                        score = 0
                        has_moved = False
                        game_over = False
                    else:
                        has_moved = True
                        pygame.mixer.Sound.play(woosh_sfx)
                        player.jump()

            if has_moved == True and not game_over:
                player.update()
                player_rect = pygame.Rect(player.x, player.y, player_img.get_width(), player_img.get_height())
                for pipe in pipes:
                    pipe_width = pipe_up_img.get_width()
                    pipe_top_height = pipe.height
                    pipe_gap = pipe.gap
                    pipe_bottom_y = pipe_top_height + pipe_gap
                    pipe_top_rect = pygame.Rect(pipe.x, 0, pipe_width, pipe_top_height)
                    pipe_bottom_rect = pygame.Rect(pipe.x, pipe_bottom_y, pipe_width, window_h - pipe_bottom_y)
                    if player_rect.colliderect(pipe_top_rect) or player_rect.colliderect(pipe_bottom_rect):
                        game_over = True
                        pygame.mixer.Sound.play(slap_sfx)
                if player.y < -64 or player.y > 536:
                    game_over = True
                    pygame.mixer.Sound.play(slap_sfx)
                for pipe in pipes:
                    pipe.update()
                if pipes[0].x < -pipe_up_img.get_width():
                    pipes.pop(0)
                    pipes.append(Pipe(400, random.randint(30, 280), 220, 2.4))
                for pipe in pipes:
                    if not pipe.scored and pipe.x + pipe_up_img.get_width() < player.x:
                        score += 1
                        pygame.mixer.Sound.play(score_sfx)
                        pipe.scored = True

            bg_x_pos -= bg_scroll_spd
            ground_x_pos -= ground_scroll_spd

            if bg_x_pos <= -bg_width:
                bg_x_pos = 0

            if ground_x_pos <= -bg_width:
                ground_x_pos = 0

            screen.fill("blue")
            screen.blit(bg_img, (bg_x_pos, 0))
            screen.blit(bg_img, (bg_x_pos + bg_width, 0))
            screen.blit(ground_img, (ground_x_pos, 536))
            screen.blit(ground_img, (ground_x_pos + bg_width, 536))

            for pipe in pipes:
                pipe.draw()

            player.draw()
            scoreboard()

            pygame.display.flip()
            clock.tick(fps)

game()