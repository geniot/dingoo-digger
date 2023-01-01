cmake_minimum_required(VERSION 3.23)
project(dingoo_digger C)

find_package(ZLIB)
find_package(SDL REQUIRED)
include_directories(${SDL_INCLUDE_DIRS})

set(CMAKE_C_STANDARD 11)

include_directories(.)

add_executable(dingoo_digger
        alpha.c
        bags.c
        bags.h
        def.h
        device.h
        digger.c
        digger.h
        drawing.c
        drawing.h
        fbsd_sup.c
        fbsd_sup.h
        hardware.h
        icon.c
        icon.h
        ini.c
        ini.h
        input.c
        input.h
        main.c
        main.h
        monster.c
        monster.h
        newsnd.c
        newsnd.h
        record.c
        record.h
        resource.h
        scores.c
        scores.h
        sdl_kbd.c
        sdl_snd.c
        sdl_snd.h
        sdl_timer.c
        sdl_vid.c
        sdl_vid.h
        sound.c
        sound.h
        sprite.c
        sprite.h
        title_gz.c
        title_gz.h
        vgagrafx.c)

target_link_libraries(dingoo_digger ${SDL_LIBRARIES})
target_link_libraries(dingoo_digger ZLIB::ZLIB)
